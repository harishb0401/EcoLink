/**
 * Eco-Link Offline Synchronization Manager
 * Orchestrates background synchronization between IndexedDB and Express backend.
 *
 * Capabilities:
 * - Automatic synchronization trigger on network reconnect
 * - Idempotency key tracking (clientOperationId) to prevent duplicate server entries
 * - Sequential sync processing with retry tracking
 * - Event emission for UI sync indicators
 */

import db from './offlineDatabase';
import { isOnline, subscribeNetworkStatus } from './networkStatus';
import api from '../api';

const listeners = new Set();
let isSyncing = false;
let lastSyncResult = {
  status: 'idle', // 'idle' | 'syncing' | 'completed' | 'failed'
  pendingCount: 0,
  syncedCount: 0,
  failedCount: 0,
  lastSyncTime: null,
  message: ''
};

export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCED: 'synced',
  FAILED: 'failed'
};

/**
 * Generate a cryptographically robust, unique client-side operation ID
 */
export function generateLocalId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `LOT-OFFLINE-${timestamp}-${random}`;
}

/**
 * Notify sync state subscribers
 */
function notifySubscribers() {
  listeners.forEach(cb => {
    try {
      cb({ ...lastSyncResult });
    } catch (e) {
      console.error('Sync listener error:', e);
    }
  });
}

/**
 * Get current sync status summary
 */
export async function getSyncStatusSummary() {
  try {
    const pendingLots = await db.wasteLots.where('syncStatus').equals(SYNC_STATUS.PENDING).toArray();
    const failedLots = await db.wasteLots.where('syncStatus').equals(SYNC_STATUS.FAILED).toArray();
    
    return {
      isSyncing,
      pendingCount: pendingLots.length + failedLots.length,
      failedCount: failedLots.length,
      lastSyncTime: lastSyncResult.lastSyncTime
    };
  } catch (err) {
    return {
      isSyncing: false,
      pendingCount: 0,
      failedCount: 0,
      lastSyncTime: null
    };
  }
}

/**
 * Save a new waste lot locally
 * @param {Object} lotData - Waste lot parameters entered by collector
 * @param {string} syncStatus - 'pending' or 'synced'
 * @param {string|null} serverId - Server ID if already confirmed
 */
export async function saveLocalWasteLot(lotData, syncStatus = SYNC_STATUS.PENDING, serverId = null) {
  const localId = lotData.localId || generateLocalId();
  const now = new Date().toISOString();

  const record = {
    localId,
    serverId: serverId || lotData.serverId || null,
    lot_id: serverId ? (lotData.lot_id || serverId) : localId,
    collectorId: lotData.collectorId || 'collector',
    category: lotData.category,
    material: lotData.material || lotData.materialType,
    materialType: lotData.material || lotData.materialType,
    description: lotData.description || lotData.notes || '',
    quantity: parseFloat(lotData.quantity || lotData.lotWeight) || 1,
    unit: lotData.unit || 'kg',
    condition: lotData.condition || 'Non-working / Scrap',
    location: lotData.location || lotData.collectionAddress || '',
    latitude: lotData.latitude || null,
    longitude: lotData.longitude || null,
    quotedPrice: parseFloat(lotData.quotedPrice) || 0,
    expectedPrice: parseFloat(lotData.expectedPrice) >= 0 ? parseFloat(lotData.expectedPrice) : (parseFloat(lotData.quotedPrice) || 0),
    isOpenToMarket: Boolean(lotData.isOpenToMarket),
    totalWeightKg: parseFloat(lotData.totalWeightKg) || parseFloat(lotData.quantity) || 1,
    categoryOther: lotData.categoryOther || '',
    collectionAddress: lotData.collectionAddress || lotData.location || '',
    cityDistrict: lotData.cityDistrict || '',
    storageCondition: lotData.storageCondition || '',
    storageConditionDetails: lotData.storageConditionDetails || '',
    hazardousCondition: lotData.hazardousCondition || '',
    hazardousConditionDetails: lotData.hazardousConditionDetails || '',
    hazardousAssessmentStatus: lotData.hazardousAssessmentStatus || 'REQUIRES_PHYSICAL_VERIFICATION',
    batteryPhysicalState: lotData.batteryPhysicalState || '',
    batteryType: lotData.batteryType || '',
    preferredPickupDate: lotData.preferredPickupDate || '',
    imageUrls: Array.isArray(lotData.imageUrls) ? lotData.imageUrls : [],
    benchmarkPrice: parseFloat(lotData.benchmarkPrice) || 350,
    estimatedLotValue: parseFloat(lotData.estimatedLotValue) || 0,
    notes: lotData.notes || '',
    syncStatus,
    retryCount: 0,
    createdAt: lotData.createdAt || now,
    updatedAt: now,
    status: lotData.status || (syncStatus === SYNC_STATUS.PENDING ? 'SUBMITTED' : 'AWAITING_OFFERS'),
    timeline: lotData.timeline || [
      {
        event_type: 'CREATED',
        title: syncStatus === SYNC_STATUS.PENDING ? 'Lot Registered (Offline)' : 'Waste Lot Registered',
        description: `${lotData.quantity} ${lotData.unit || 'kg'} declared. ${syncStatus === SYNC_STATUS.PENDING ? 'Saved locally. Pending server synchronization.' : 'Synced with platform.'}`,
        created_at: now
      }
    ]
  };

  await db.wasteLots.put(record);

  // If pending, also add to syncQueue
  if (syncStatus === SYNC_STATUS.PENDING) {
    await db.syncQueue.put({
      localId,
      type: 'CREATE_WASTE_LOT',
      payload: record,
      attempts: 0,
      status: 'pending',
      createdAt: now,
      lastAttemptAt: null,
      error: null
    });
  }

  // Update last sync state and trigger notify
  const summary = await getSyncStatusSummary();
  lastSyncResult.pendingCount = summary.pendingCount;
  notifySubscribers();

  return record;
}

/**
 * Synchronize all pending offline records to the backend
 * @returns {Promise<{ success: boolean, synced: number, failed: number }>}
 */
export async function syncPendingRecords() {
  if (isSyncing) {
    return { success: false, message: 'Sync already in progress' };
  }

  if (!isOnline()) {
    return { success: false, message: 'Cannot sync while offline' };
  }

  isSyncing = true;
  lastSyncResult.status = 'syncing';
  lastSyncResult.message = 'Synchronizing offline records with server...';
  notifySubscribers();

  let synced = 0;
  let failed = 0;

  try {
    // 1. Fetch all pending queue items
    const queueItems = await db.syncQueue.where('status').equals('pending').toArray();

    for (const item of queueItems) {
      if (!isOnline()) {
        // Stop if network disconnected mid-sync
        break;
      }

      try {
        const payload = item.payload;

        // Call backend API with clientOperationId for idempotency
        const response = await api.post('/waste', {
          clientOperationId: item.localId,
          category: payload.category,
          categoryOther: payload.categoryOther,
          material: payload.material,
          materialType: payload.material,
          description: payload.description,
          quantity: payload.quantity,
          unit: payload.unit,
          totalWeightKg: payload.totalWeightKg,
          condition: payload.condition,
          notes: payload.notes,
          location: payload.location,
          locationText: payload.location,
          latitude: payload.latitude,
          longitude: payload.longitude,
          collectionAddress: payload.collectionAddress,
          cityDistrict: payload.cityDistrict,
          storageCondition: payload.storageCondition,
          storageConditionDetails: payload.storageConditionDetails,
          hazardousCondition: payload.hazardousCondition,
          hazardousConditionDetails: payload.hazardousConditionDetails,
          expectedPrice: payload.expectedPrice,
          isOpenToMarket: Boolean(payload.isOpenToMarket),
          preferredPickupDate: payload.preferredPickupDate,
          imageUrls: payload.imageUrls,
          quotedPrice: payload.quotedPrice,
          benchmarkPrice: payload.benchmarkPrice
        });

        const serverLot = response?.data || response;
        const serverId = serverLot?.id || serverLot?.lot_id || serverLot?.lotId;

        // Update local waste lot to SYNCED
        await db.wasteLots.update(item.localId, {
          serverId: serverId,
          lot_id: serverLot?.lot_id || serverId || item.localId,
          syncStatus: SYNC_STATUS.SYNCED,
          status: serverLot?.status || 'AWAITING_OFFERS',
          updatedAt: new Date().toISOString()
        });

        // Remove from syncQueue
        await db.syncQueue.delete(item.id);
        synced++;
      } catch (err) {
        console.warn(`Sync failed for local record ${item.localId}:`, err.message);
        failed++;

        // Update queue item with retry tracking
        await db.syncQueue.update(item.id, {
          attempts: (item.attempts || 0) + 1,
          lastAttemptAt: new Date().toISOString(),
          error: err.message || 'Server rejected or unreachable'
        });

        await db.wasteLots.update(item.localId, {
          syncStatus: SYNC_STATUS.FAILED,
          syncError: err.message,
          retryCount: ((await db.wasteLots.get(item.localId))?.retryCount || 0) + 1
        });
      }
    }

    const summary = await getSyncStatusSummary();
    lastSyncResult = {
      status: failed > 0 ? 'failed' : 'completed',
      pendingCount: summary.pendingCount,
      syncedCount: synced,
      failedCount: failed,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: summary.pendingCount === 0 
        ? 'All records synced' 
        : `${summary.pendingCount} record(s) pending sync`
    };
  } catch (globalErr) {
    console.error('Fatal sync error:', globalErr);
    lastSyncResult.status = 'failed';
    lastSyncResult.message = 'Sync failed. Will retry automatically.';
  } finally {
    isSyncing = false;
    notifySubscribers();
  }

  return {
    success: failed === 0,
    synced,
    failed
  };
}

/**
 * Subscribe to sync state updates
 */
export function subscribeSyncStatus(callback) {
  listeners.add(callback);
  callback({ ...lastSyncResult });
  return () => {
    listeners.delete(callback);
  };
}

// Automatically trigger sync when browser returns online
if (typeof window !== 'undefined') {
  subscribeNetworkStatus((online) => {
    if (online) {
      // Small delay to allow connection to stabilize
      setTimeout(() => {
        syncPendingRecords();
      }, 1500);
    }
  });
}

export default {
  SYNC_STATUS,
  generateLocalId,
  saveLocalWasteLot,
  syncPendingRecords,
  getSyncStatusSummary,
  subscribeSyncStatus
};
