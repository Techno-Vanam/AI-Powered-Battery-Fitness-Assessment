import { getDBConnection } from './schema';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface WeightMeasurementRecord {
  id: string;
  weight: number;
  ocrRawText?: string;
  ocrConfidence: number;
  capturedImagePath?: string;
  timestamp: string;
  syncStatus: 'Pending' | 'Uploading' | 'Synced';
  retryCount: number;
}

export const saveWeightMeasurement = (data: {
  id?: string;
  weight: number;
  ocrRawText?: string;
  ocrConfidence: number;
  capturedImagePath?: string;
  timestamp?: string;
  syncStatus?: 'Pending' | 'Uploading' | 'Synced';
}): WeightMeasurementRecord => {
  const db = getDBConnection();
  const id = data.id || uuidv4();
  const timestamp = data.timestamp || new Date().toISOString();
  const syncStatus = data.syncStatus || 'Pending';
  const ocrRawText = data.ocrRawText || '';
  const capturedImagePath = data.capturedImagePath || '';

  db.executeSync(
    `INSERT INTO WeightMeasurements (
      id, weight, ocrRawText, ocrConfidence, capturedImagePath, timestamp, syncStatus, retryCount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    ON CONFLICT(id) DO UPDATE SET
      weight = excluded.weight,
      ocrRawText = excluded.ocrRawText,
      ocrConfidence = excluded.ocrConfidence,
      capturedImagePath = excluded.capturedImagePath,
      syncStatus = excluded.syncStatus`,
    [
      id,
      data.weight,
      ocrRawText,
      data.ocrConfidence,
      capturedImagePath,
      timestamp,
      syncStatus,
    ]
  );

  return {
    id,
    weight: data.weight,
    ocrRawText,
    ocrConfidence: data.ocrConfidence,
    capturedImagePath,
    timestamp,
    syncStatus,
    retryCount: 0,
  };
};

export const getPendingWeightMeasurements = (): WeightMeasurementRecord[] => {
  const db = getDBConnection();
  const result = db.executeSync(
    `SELECT * FROM WeightMeasurements WHERE syncStatus != 'Synced' ORDER BY timestamp ASC`
  );
  if (result.rows && result.rows.length > 0) {
    return result.rows as unknown as WeightMeasurementRecord[];
  }
  return [];
};

export const getPendingWeightCount = (): number => {
  const db = getDBConnection();
  const result = db.executeSync(
    `SELECT COUNT(*) as count FROM WeightMeasurements WHERE syncStatus != 'Synced'`
  );
  if (result.rows && result.rows.length > 0) {
    return (result.rows[0] as any).count ?? 0;
  }
  return 0;
};

export const getLastWeightMeasurement = (): WeightMeasurementRecord | null => {
  const db = getDBConnection();
  const result = db.executeSync(
    `SELECT * FROM WeightMeasurements ORDER BY timestamp DESC LIMIT 1`
  );
  if (result.rows && result.rows.length > 0) {
    return result.rows[0] as unknown as WeightMeasurementRecord;
  }
  return null;
};

export const updateWeightSyncStatus = (
  id: string,
  status: 'Pending' | 'Uploading' | 'Synced',
  incrementRetry = false
): void => {
  const db = getDBConnection();
  if (incrementRetry) {
    db.executeSync(
      `UPDATE WeightMeasurements SET syncStatus = ?, retryCount = retryCount + 1 WHERE id = ?`,
      [status, id]
    );
  } else {
    db.executeSync(
      `UPDATE WeightMeasurements SET syncStatus = ? WHERE id = ?`,
      [status, id]
    );
  }
};

export const deleteWeightMeasurement = (id: string): void => {
  const db = getDBConnection();
  db.executeSync(`DELETE FROM WeightMeasurements WHERE id = ?`, [id]);
};
