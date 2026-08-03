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

    try {
      const pendingRecords = SQLiteService.getPendingMeasurements();
      if (pendingRecords.length === 0) {
        _isSyncing = false;
        return { count: 0, success: true };
      }

      const payloads: WeightPayload[] = pendingRecords.map((r) => ({
        id: r.id,
        weight: r.weight,
        ocr_confidence: r.ocrConfidence,
        captured_at: r.timestamp,
      }));

      const syncResult = await WeightAPIService.syncPendingMeasurements(payloads);

      if (syncResult.success && syncResult.syncedIds.length > 0) {
        syncedCount = syncResult.syncedIds.length;

        for (const record of pendingRecords) {
          if (syncResult.syncedIds.includes(record.id)) {
            // Delete temporary SQLite cache record
            SQLiteService.deleteMeasurement(record.id);

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
        // 3. Immediately delete temporary SQLite record & captured image file
        SQLiteService.deleteMeasurement(savedRecord.id);
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
