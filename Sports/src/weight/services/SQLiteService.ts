import { WeightMeasurement, SyncStatus } from '../types';
import { WEIGHT_CONFIG } from '../constants';
import { CREATE_WEIGHT_MEASUREMENTS_TABLE } from '../database/schema';

// In-memory cache fallback if native SQLite module is not linked/available in runtime environment
const memoryCache = new Map<string, WeightMeasurement>();
let isNativeDBConnected = false;
let dbInstance: any = null;

class SQLiteService {
  private initialized = false;

  /**
   * Initialize SQLite Database and create WeightMeasurements table
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Attempt importing react-native-quick-sqlite or fallback
      const { open } = require('react-native-quick-sqlite');
      dbInstance = open({ name: 'weight_cache.db' });
      dbInstance.execute(CREATE_WEIGHT_MEASUREMENTS_TABLE);
      isNativeDBConnected = true;
      console.log('[SQLiteService] Native SQLite Database initialized successfully.');
    } catch (e: any) {
      console.warn('[SQLiteService] Native SQLite module unavailable or not linked. Operating in memory-cached SQLite mode.', e?.message);
      isNativeDBConnected = false;
    }

    this.initialized = true;
  }

  /**
   * Save a new measurement into SQLite (Temporary Cache)
   */
  async saveMeasurement(measurement: WeightMeasurement): Promise<WeightMeasurement> {
    await this.init();

    if (isNativeDBConnected && dbInstance) {
      try {
        const query = `
          INSERT OR REPLACE INTO ${WEIGHT_CONFIG.TABLE_NAME} 
          (id, weight, ocrRawText, ocrConfidence, capturedImagePath, timestamp, syncStatus, retryCount, errorMessage)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const params = [
          measurement.id,
          measurement.weight,
          measurement.ocrRawText || '',
          measurement.ocrConfidence,
          measurement.capturedImagePath || '',
          measurement.timestamp,
          measurement.syncStatus,
          measurement.retryCount,
          measurement.errorMessage || null
        ];
        dbInstance.execute(query, params);
      } catch (err: any) {
        console.error('[SQLiteService] Native insert error:', err);
      }
    }

    // Always keep memory cache synced
    memoryCache.set(measurement.id, { ...measurement });
    return measurement;
  }

  /**
   * Get all pending measurements stored in SQLite
   */
  async getPendingMeasurements(): Promise<WeightMeasurement[]> {
    await this.init();

    if (isNativeDBConnected && dbInstance) {
      try {
        const query = `SELECT * FROM ${WEIGHT_CONFIG.TABLE_NAME} WHERE syncStatus != 'Synced' ORDER BY timestamp DESC;`;
        const result = dbInstance.execute(query);
        const rows: WeightMeasurement[] = [];
        if (result && result.rows) {
          for (let i = 0; i < result.rows.length; i++) {
            const item = result.rows.item(i);
            rows.push({
              id: item.id,
              weight: Number(item.weight),
              ocrRawText: item.ocrRawText,
              ocrConfidence: Number(item.ocrConfidence),
              capturedImagePath: item.capturedImagePath,
              timestamp: item.timestamp,
              syncStatus: item.syncStatus as SyncStatus,
              retryCount: Number(item.retryCount),
              errorMessage: item.errorMessage
            });
          }
          return rows;
        }
      } catch (err) {
        console.error('[SQLiteService] Native getPending error:', err);
      }
    }

    // Memory cache fallback
    const pendingList = Array.from(memoryCache.values()).filter(m => m.syncStatus !== 'Synced');
    pendingList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return pendingList;
  }

  /**
   * Count total pending measurements
   */
  async getPendingCount(): Promise<number> {
    const list = await this.getPendingMeasurements();
    return list.length;
  }

  /**
   * Update sync status and retry count of a record
   */
  async updateStatus(id: string, status: SyncStatus, errorMessage?: string): Promise<void> {
    await this.init();

    const existing = memoryCache.get(id);
    if (existing) {
      existing.syncStatus = status;
      if (status === 'Failed') {
        existing.retryCount += 1;
      }
      if (errorMessage) {
        existing.errorMessage = errorMessage;
      }
      memoryCache.set(id, existing);
    }

    if (isNativeDBConnected && dbInstance) {
      try {
        const query = `
          UPDATE ${WEIGHT_CONFIG.TABLE_NAME} 
          SET syncStatus = ?, retryCount = retryCount + ?, errorMessage = ?
          WHERE id = ?;
        `;
        dbInstance.execute(query, [status, status === 'Failed' ? 1 : 0, errorMessage || null, id]);
      } catch (err) {
        console.error('[SQLiteService] Native updateStatus error:', err);
      }
    }
  }

  /**
   * Remove record from SQLite after successful upload to backend
   */
  async deleteMeasurement(id: string): Promise<void> {
    await this.init();

    memoryCache.delete(id);

    if (isNativeDBConnected && dbInstance) {
      try {
        const query = `DELETE FROM ${WEIGHT_CONFIG.TABLE_NAME} WHERE id = ?;`;
        dbInstance.execute(query, [id]);
        console.log(`[SQLiteService] Removed record ${id} from SQLite.`);
      } catch (err) {
        console.error('[SQLiteService] Native deleteMeasurement error:', err);
      }
    }
  }

  /**
   * Clear all cached data
   */
  async clearAll(): Promise<void> {
    await this.init();
    memoryCache.clear();
    if (isNativeDBConnected && dbInstance) {
      try {
        dbInstance.execute(`DELETE FROM ${WEIGHT_CONFIG.TABLE_NAME};`);
      } catch (err) {}
    }
  }
}

export default new SQLiteService();
