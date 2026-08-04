import { dbGet, dbRun, dbExecute, withTransaction } from '../database/db.js';

export async function insertWeightMeasurement(record) {
  const now = new Date().toISOString();
  const capturedAt = record.captured_at || record.timestamp || now;
  const createdAt = record.created_at || now;
  const updatedAt = record.updated_at || now;

  await dbRun(
    `INSERT INTO weight_measurements (
      id, weight, ocr_confidence, captured_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      weight = excluded.weight,
      ocr_confidence = excluded.ocr_confidence,
      captured_at = excluded.captured_at,
      updated_at = excluded.updated_at`,
    [
      record.id,
      record.weight,
      record.ocr_confidence ?? record.ocrConfidence ?? 1.0,
      capturedAt,
      createdAt,
      updatedAt,
    ]
  );

  return findWeightMeasurementById(record.id);
}

export async function findWeightMeasurementById(id) {
  return dbGet(`SELECT * FROM weight_measurements WHERE id = ?`, [id]);
}

export async function findAllWeightMeasurements() {
  const result = await dbExecute(`SELECT * FROM weight_measurements ORDER BY captured_at DESC`);
  return result.rows || [];
}

export async function bulkInsertWeightMeasurements(records) {
  const syncedIds = [];
  await withTransaction(async (tx) => {
    const now = new Date().toISOString();
    for (const record of records) {
      const capturedAt = record.captured_at || record.timestamp || now;
      const createdAt = record.created_at || now;
      const updatedAt = record.updated_at || now;

      await tx.execute(
        `INSERT INTO weight_measurements (
          id, weight, ocr_confidence, captured_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          weight = excluded.weight,
          ocr_confidence = excluded.ocr_confidence,
          captured_at = excluded.captured_at,
          updated_at = excluded.updated_at`,
        [
          record.id,
          record.weight,
          record.ocr_confidence ?? record.ocrConfidence ?? 1.0,
          capturedAt,
          createdAt,
          updatedAt,
        ]
      );
      syncedIds.push(record.id);
    }
  });

  return syncedIds;
}
