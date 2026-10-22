import api from './api';
import db from './offline/offlineDatabase';
import { isOnline } from './offline/networkStatus';
import { saveLocalWasteLot, SYNC_STATUS } from './offline/syncManager';

export const wasteService = {
  /**
   * Create Waste Lot:
   * - If online: post to backend and cache result locally
   * - If offline: save into IndexedDB with syncStatus = 'pending'
   */
  async createLot(lotData) {
    if (!isOnline()) {
      const localRecord = await saveLocalWasteLot(lotData, SYNC_STATUS.PENDING);
      return {
        ...localRecord,
        id: localRecord.localId,
        lotId: localRecord.localId,
        isOfflineRecord: true
      };
    }

    try {
      const res = await api.post('/waste', lotData);
      const serverData = res.data;
      // Also cache synced lot in local database for offline availability
      saveLocalWasteLot(serverData, SYNC_STATUS.SYNCED, serverData.id || serverData.lot_id).catch(() => {});
      return serverData;
    } catch (err) {
      // If network dropped mid-flight, fall back to offline storage
      if (!isOnline() || err.message?.includes('Network') || err.message?.includes('Failed to fetch')) {
        const localRecord = await saveLocalWasteLot(lotData, SYNC_STATUS.PENDING);
        return {
          ...localRecord,
          id: localRecord.localId,
          lotId: localRecord.localId,
          isOfflineRecord: true
        };
      }
      throw err;
    }
  },

  /**
   * Get Collector's waste lots:
   * - Merges server lots with any local pending/unsynced lots from IndexedDB
   * - Fallback to IndexedDB when offline
   */
  async getMyLots() {
    // 1. If offline, return local IndexedDB lots
    if (!isOnline()) {
      try {
        const localLots = await db.wasteLots.toArray();
        return (localLots || []).map(lot => ({
          ...lot,
          id: lot.lot_id || lot.localId,
          lotId: lot.lot_id || lot.localId,
          totalWeightKg: lot.quantity,
          benchmarkPrice: lot.benchmarkPrice,
          estimatedLotValue: lot.estimatedLotValue || Math.round((lot.benchmarkPrice || 350) * lot.quantity)
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (e) {
        return [];
      }
    }

    // 2. If online, fetch from backend and merge any pending offline records
    try {
      const res = await api.get('/waste/my');
      const serverLots = res.data || [];

      // Fetch unsynced records from IndexedDB
      const pendingLots = await db.wasteLots.where('syncStatus').equals(SYNC_STATUS.PENDING).toArray();
      const failedLots = await db.wasteLots.where('syncStatus').equals(SYNC_STATUS.FAILED).toArray();
      const unsynced = [...pendingLots, ...failedLots];

      const serverIds = new Set(serverLots.map(l => l.lot_id || l.id));
      const formattedPending = unsynced
        .filter(l => !serverIds.has(l.serverId) && !serverIds.has(l.lot_id))
        .map(l => ({
          ...l,
          id: l.localId,
          lotId: l.localId,
          totalWeightKg: l.quantity,
          benchmarkPrice: l.benchmarkPrice,
          estimatedLotValue: l.estimatedLotValue || Math.round((l.benchmarkPrice || 350) * l.quantity)
        }));

      return [...formattedPending, ...serverLots];
    } catch (err) {
      // Network failure: fallback to local records
      try {
        const localLots = await db.wasteLots.toArray();
        return localLots || [];
      } catch (e) {
        return [];
      }
    }
  },

  async getAvailableLots() {
    if (!isOnline()) {
      return [];
    }
    const res = await api.get('/waste/available');
    return res.data || [];
  },

  async getLotById(lotId) {
    if (!isOnline()) {
      // Look up in IndexedDB by localId or lot_id
      const local = await db.wasteLots.get(lotId) || 
                    await db.wasteLots.where('lot_id').equals(lotId).first();
      if (local) {
        return {
          ...local,
          id: local.lot_id || local.localId,
          lotId: local.lot_id || local.localId,
          totalWeightKg: local.quantity
        };
      }
    }
    const res = await api.get(`/waste/${lotId}`);
    return res.data;
  },

  async getLotOffers(lotId) {
    if (!isOnline()) {
      return [];
    }
    const res = await api.get(`/waste/${lotId}/offers`);
    return res.data || [];
  },

  async cancelLot(lotId) {
    const res = await api.post(`/waste/${lotId}/cancel`);
    return res.data;
  },

  /**
   * Upload waste image:
   * - Converts file to Base64
   * - Uploads to Supabase Storage via backend API when online
   * - Returns public URL or local preview data URL if offline
   */
  async uploadImage(file) {
    if (!file) throw new Error('No file provided');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error('Unsupported format. Allowed formats: JPG, JPEG, PNG, WEBP');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File exceeds 5MB size limit');
    }

    // Convert file to base64 string
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    if (!isOnline()) {
      return {
        success: true,
        url: base64,
        filename: file.name,
        isOffline: true
      };
    }

    try {
      const res = await api.post('/waste/upload-image', {
        imageBase64: base64,
        filename: file.name,
        contentType: file.type
      });
      return res.data;
    } catch (err) {
      // If network upload fails, fall back to base64 so registration is not blocked
      return {
        success: true,
        url: base64,
        filename: file.name,
        isOffline: true
      };
    }
  }
};

export default wasteService;
