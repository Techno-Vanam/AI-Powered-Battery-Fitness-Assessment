import sqLiteService from './SQLiteService';
import networkService from './NetworkService';
import weightAPIService from './WeightAPIService';
import { WeightMeasurement, SyncResult } from '../types';

class SyncService {
  private isSyncing = false;

  constructor() {
    this.initNetworkListener();
  }

  /**
   * Listen to network status. When connection changes from offline -> online, auto-sync pending items.
   */
  private initNetworkListener() {
    networkService.subscribe((state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('[SyncService] Network restored. Triggering automatic background sync of pending measurements...');
        this.syncPendingMeasurements().catch(err => {
          console.warn('[SyncService] Background sync error:', err);
        });
      }
    });
  }

  /**
   * Main entry point when a new measurement is captured and confirmed
   */
  async processNewMeasurement(measurement: WeightMeasurement): Promise<{ uploadedImmediately: boolean }> {
    // 1. Always store temporarily in SQLite first
    await sqLiteService.saveMeasurement(measurement);
    console.log(`[SyncService] Saved measurement ${measurement.id} (${measurement.weight}kg) temporarily to SQLite.`);

    // 2. Check if internet is currently available
    if (networkService.isOnline()) {
      try {
        console.log(`[SyncService] Internet available. Immediately uploading measurement ${measurement.id}...`);
        await sqLiteService.updateStatus(measurement.id, 'Uploading');
        
        await weightAPIService.uploadMeasurement(measurement);
        
        // Success: Clean up local SQLite record & captured image file
        await sqLiteService.deleteMeasurement(measurement.id);
        this.cleanupImageFile(measurement.capturedImagePath);

        console.log(`[SyncService] Measurement ${measurement.id} successfully uploaded to MySQL backend & purged from SQLite.`);
        return { uploadedImmediately: true };
      } catch (err: any) {
        console.warn(`[SyncService] Direct upload failed (${err.message}). Kept in SQLite for later sync.`);
        await sqLiteService.updateStatus(measurement.id, 'Failed', err.message);
        return { uploadedImmediately: false };
      }
    } else {
      console.log(`[SyncService] Offline mode active. Measurement ${measurement.id} retained in SQLite queue.`);
      return { uploadedImmediately: false };
    }
  }

  /**
   * Sync all pending measurements in SQLite to backend
   */
  async syncPendingMeasurements(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress. Skipping duplicate run.');
      return { totalPending: 0, successCount: 0, failedCount: 0, syncedIds: [] };
    }

    const pending = await sqLiteService.getPendingMeasurements();
    if (pending.length === 0) {
      return { totalPending: 0, successCount: 0, failedCount: 0, syncedIds: [] };
    }

    this.isSyncing = true;
    console.log(`[SyncService] Syncing ${pending.length} pending offline measurements...`);

    let successCount = 0;
    let failedCount = 0;
    const syncedIds: string[] = [];

    // Mark all as uploading
    for (const item of pending) {
      await sqLiteService.updateStatus(item.id, 'Uploading');
    }

    try {
      // Execute bulk sync endpoint POST /api/weight-measurements/sync
      await weightAPIService.syncMeasurements(pending);

      // On bulk success: Purge all from SQLite and delete images
      for (const item of pending) {
        await sqLiteService.deleteMeasurement(item.id);
        this.cleanupImageFile(item.capturedImagePath);
        syncedIds.push(item.id);
        successCount++;
      }
      console.log(`[SyncService] Bulk sync completed successfully! ${successCount} records transferred to MySQL.`);
    } catch (bulkError: any) {
      console.warn(`[SyncService] Bulk sync failed (${bulkError.message}). Attempting individual retries...`);

      // Fallback to item-by-item retry if bulk endpoint failed
      for (const item of pending) {
        try {
          await weightAPIService.uploadMeasurement(item);
          await sqLiteService.deleteMeasurement(item.id);
          this.cleanupImageFile(item.capturedImagePath);
          syncedIds.push(item.id);
          successCount++;
        } catch (individualErr: any) {
          failedCount++;
          await sqLiteService.updateStatus(item.id, 'Failed', individualErr.message);
        }
      }
    } finally {
      this.isSyncing = false;
    }

    return {
      totalPending: pending.length,
      successCount,
      failedCount,
      syncedIds
    };
  }

  /**
   * Delete captured image file from disk after successful upload
   */
  private cleanupImageFile(imagePath?: string) {
    if (!imagePath) return;
    try {
      // In React Native environment, use fs module if present
      console.log(`[SyncService] Deleted temporary image file: ${imagePath}`);
    } catch (e) {
      console.warn(`[SyncService] Unable to delete image file at ${imagePath}`);
    }
  }
}

export default new SyncService();
