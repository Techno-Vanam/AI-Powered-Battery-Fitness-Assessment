import NetInfo from '@react-native-community/netinfo';
import { fetchApi } from '../config/api';
import {
  getAllPendingSync,
  incrementAttempts,
  removeSyncItem,
  clearLocalOtpAfterSync,
  markUserSynced,
  markUserConflict,
  markUserSynced,
} from '../db/syncQueueRepository';
import { getUserByLocalId } from '../db/userRepository';
import { NetworkService } from './NetworkService';
import { SQLiteService } from './SQLiteService';
import { WeightAPIService, WeightPayload } from './WeightAPIService';
import { ImageProcessingService } from './ImageProcessingService';

type SyncListener = () => void;

let _isSyncing = false;
const _syncListeners = new Set<SyncListener>();

export const SyncService = {
  /**
   * Registers a callback listener to notify UI when background sync completes
   */
  subscribeToSyncEvents(listener: SyncListener): () => void {
    _syncListeners.add(listener);
    return () => {
      _syncListeners.delete(listener);
    };
  },

  /**
   * Triggers automatic synchronization of pending SQLite records to backend
   */
  async syncPendingRecords(): Promise<{ count: number; success: boolean }> {
    if (_isSyncing) {
      return { count: 0, success: true };
    }

    const isOnline = await NetworkService.isConnected();
    if (!isOnline) {
      return { count: 0, success: false };
    }

    _isSyncing = true;
    let syncedCount = 0;

    // 1. Sync pending user registration queue items
    const pendingItems = getAllPendingSync();
    if (pendingItems.length > 0) {
      try {
        const usersToSync = pendingItems
          .map(item => getUserByLocalId(item.entity_local_id))
          .filter(Boolean);

        if (usersToSync.length > 0) {
          const response = await fetchApi('/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: usersToSync }),
          });

          if (response.ok) {
            const body = (await response.json()) as any;
            const details = body.data?.details ?? [];
            const detailByLocalId = new Map<string, any>(details.map((d: any) => [d.local_id, d]));

            for (const item of pendingItems) {
              const detail = detailByLocalId.get(item.entity_local_id);

              if (detail?.status === 'conflict') {
                markUserConflict(item.entity_local_id);
                removeSyncItem(item.queue_id);
                console.warn(`[Sync] Conflict for ${item.entity_local_id}`);
                continue;
              }

              if (detail?.status === 'failed') {
                incrementAttempts(item.queue_id);
                console.warn(`[Sync] Failed for ${item.entity_local_id}: ${detail.reason}`);
                continue;
              }

              if (detail?.status === 'synced' || detail?.status === 'updated') {
                removeSyncItem(item.queue_id);
                markUserSynced(item.entity_local_id, detail.server_id);
                clearLocalOtpAfterSync(item.entity_local_id);
                console.log(`[Sync] ✓ ${item.entity_local_id} → cloud, kept local cache`);
                syncedCount++;
                continue;
              }

              incrementAttempts(item.queue_id);
            }
          }
        }
      } catch (err) {
        console.warn('[SyncService] User sync error:', err);
      }
    }

    try {
      const pendingRecords = SQLiteService.getPendingMeasurements();
      if (pendingRecords.length > 0) {
        const payloads: WeightPayload[] = pendingRecords.map((r) => ({
          id: r.id,
          weight: r.weight,
          ocr_confidence: r.ocrConfidence,
          captured_at: r.timestamp,
        }));

        const syncResult = await WeightAPIService.syncPendingMeasurements(payloads);

        if (syncResult.success && syncResult.syncedIds.length > 0) {
          syncedCount += syncResult.syncedIds.length;

          for (const record of pendingRecords) {
            if (syncResult.syncedIds.includes(record.id)) {
              // Update status to Synced in SQLite cache
              SQLiteService.updateSyncStatus(record.id, 'Synced');

              // Delete temporary captured image file
              if (record.capturedImagePath) {
                await ImageProcessingService.deleteTempImage(record.capturedImagePath);
              }
            } else {
              SQLiteService.updateSyncStatus(record.id, 'Pending', true);
            }
          }

          // Notify subscribers to refresh UI
          _syncListeners.forEach((fn) => fn());
        }
      }
    } catch (err) {
      console.warn('[SyncService] Background sync error:', err);
    } finally {
      _isSyncing = false;
    }

    return { count: syncedCount, success: syncedCount > 0 };
  },

  /**
   * Process single measurement workflow according to Online/Offline logic
   */
  async processMeasurementWorkflow(measurementData: {
    id?: string;
    weight: number;
    ocrRawText?: string;
    ocrConfidence: number;
    capturedImagePath?: string;
  }): Promise<{ isUploaded: boolean; savedRecord: any }> {
    // 1. Temporarily save in SQLite
    const savedRecord = SQLiteService.saveMeasurement({
      id: measurementData.id,
      weight: measurementData.weight,
      ocrRawText: measurementData.ocrRawText,
      ocrConfidence: measurementData.ocrConfidence,
      capturedImagePath: measurementData.capturedImagePath,
      syncStatus: 'Pending',
    });

    // 2. Check current network connectivity
    const isOnline = await NetworkService.isConnected();

    if (isOnline) {
      // Set status to Uploading
      SQLiteService.updateSyncStatus(savedRecord.id, 'Uploading');

      const payload: WeightPayload = {
        id: savedRecord.id,
        weight: savedRecord.weight,
        ocr_confidence: savedRecord.ocrConfidence,
        captured_at: savedRecord.timestamp,
      };

      const success = await WeightAPIService.uploadMeasurement(payload);

      if (success) {
        // 3. Mark as Synced in SQLite cache & cleanup captured image file
        SQLiteService.updateSyncStatus(savedRecord.id, 'Synced');
        if (savedRecord.capturedImagePath) {
          await ImageProcessingService.deleteTempImage(savedRecord.capturedImagePath);
        }
        return { isUploaded: true, savedRecord };
      } else {
        // Revert status to Pending for retry
        SQLiteService.updateSyncStatus(savedRecord.id, 'Pending', true);
        return { isUploaded: false, savedRecord };
      }
    }

    return { isUploaded: false, savedRecord };
  },

  /**
   * Initializes automatic network change listener for background sync
   */
  initAutoSyncListener(): () => void {
    const unsubscribe = NetworkService.subscribe((isConnected) => {
      if (isConnected) {
        SyncService.syncPendingRecords();
      }
    });

    return unsubscribe;
  },
};

export const runSyncJob = async () => {
  return SyncService.syncPendingRecords();
};

export const startSyncListener = (): (() => void) => {
  return SyncService.initAutoSyncListener();
};

export default SyncService;
