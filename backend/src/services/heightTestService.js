import * as repo from '../repositories/heightTestRepository.js';

export async function uploadHeightTest(payload) {
  const existing = await repo.findHeightTestByMeasurementId(payload.measurementId);
  if (existing) {
    return {
      measurementId: existing.measurement_id,
      createdAt: existing.timestamp,
      idempotent: true,
    };
  }

  const row = await repo.insertHeightTest(payload);
  return {
    measurementId: row.measurement_id,
    createdAt: row.timestamp,
    idempotent: false,
  };
}

export async function heightTestExists(measurementId) {
  const row = await repo.findHeightTestByMeasurementId(measurementId);
  return Boolean(row);
}

export async function getHeightTest(measurementId) {
  return repo.findHeightTestByMeasurementId(measurementId);
}
