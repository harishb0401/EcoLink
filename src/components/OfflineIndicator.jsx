import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, WifiOff, RefreshCw, ChevronDown 
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { subscribeSyncStatus, syncPendingRecords } from '../services/offline/syncManager';

export default function OfflineIndicator({ currentRole }) {
  const { online, simulatedOffline, toggleSimulatedOffline } = useOnlineStatus();
  const [syncState, setSyncState] = useState({
    status: 'idle',
    pendingCount: 0,
    syncedCount: 0,
    failedCount: 0,
    lastSyncTime: null,
    message: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeSyncStatus(state => setSyncState(state));
    return unsub;
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualSync = async () => {
    if (!online) {
      alert("Cannot sync while offline. Please connect to the internet or disable offline simulation.");
      return;
    }
    await syncPendingRecords();
  };

  const isSyncing = syncState.status === 'syncing';
  const hasPending = syncState.pendingCount > 0;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Compact Status Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer bg-[#F5FBF7] border-2 border-[#D6E8DF] hover:border-[#B8D9C8] text-[#555555] hover:text-[#222222]"
        title="Network & Offline Sync Status"
      >
        {isSyncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-[#1F6F5F] animate-spin" />
            <span>Syncing...</span>
          </>
        ) : online ? (
          <>
            <span className="w-2 h-2 rounded-full bg-[#6FCF97]" />
            <Wifi className="w-3.5 h-3.5 text-[#1F6F5F]" />
            <span>Online</span>
            {hasPending && (
              <span className="text-[#1F6F5F] text-[10px] font-bold">
                ({syncState.pendingCount})
              </span>
            )}
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-[#555555]" />
            <WifiOff className="w-3.5 h-3.5 text-[#555555]" />
            <span>Offline</span>
            {hasPending && (
              <span className="text-[#555555] text-[10px] font-bold">
                • {syncState.pendingCount}
              </span>
            )}
          </>
        )}
        <ChevronDown className="w-3 h-3 text-[#555555] ml-0.5" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#F5FBF7] rounded-xl border-2 border-[#D6E8DF] p-4 z-50 text-[#222222] space-y-3 text-xs shadow-none">
          <div className="flex items-center justify-between border-b border-[#D6E8DF] pb-2">
            <span className="font-bold text-[#222222] uppercase tracking-wider text-[10px]">
              Connection & Sync
            </span>
            <span className="text-[10px] font-medium text-[#1F6F5F] bg-[#EFF8F2] border-2 border-[#D6E8DF] px-2 py-0.5 rounded-lg">
              {online ? 'Connected' : 'Offline Mode'}
            </span>
          </div>

          {/* Sync status summary */}
          <div className="space-y-1.5 bg-[#EFF8F2] p-3 rounded-lg border-2 border-[#D6E8DF]">
            <div className="flex items-center justify-between">
              <span className="text-[#555555]">Pending Records:</span>
              <strong className={syncState.pendingCount > 0 ? "text-[#1F6F5F] font-bold" : "text-[#555555] font-normal"}>
                {syncState.pendingCount === 0 ? "0 (All Synced)" : `${syncState.pendingCount} waiting`}
              </strong>
            </div>
            {syncState.lastSyncTime && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#555555]">Last Sync:</span>
                <span className="text-[#222222]">{syncState.lastSyncTime}</span>
              </div>
            )}
            {syncState.message && (
              <p className="text-[11px] font-medium text-[#1F6F5F] pt-1 border-t border-[#D6E8DF]">
                {syncState.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={!online || isSyncing || syncState.pendingCount === 0}
              className="w-full py-2 bg-[#1F6F5F] hover:bg-[#2FA084] disabled:opacity-50 text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            {/* Simulated Offline Toggle */}
            <button
              type="button"
              onClick={toggleSimulatedOffline}
              className="w-full py-2 rounded-lg font-medium text-xs border-2 border-[#D6E8DF] bg-[#F5FBF7] hover:border-[#B8D9C8] text-[#555555] hover:text-[#222222] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {simulatedOffline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#1F6F5F]" />
                  <span>Disable Offline Simulation</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[#555555]" />
                  <span>Simulate Offline Mode</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-[#555555] leading-tight text-center pt-1 border-t border-[#D6E8DF]">
            Offline records are stored in browser IndexedDB and sync automatically when connection returns.
          </p>
        </div>
      )}
    </div>
  );
}
