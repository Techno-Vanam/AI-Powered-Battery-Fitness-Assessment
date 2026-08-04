import { v4 as uuidv4 } from 'uuid';
import {
  insertWeightMeasurement,
  findWeightMeasurementById,
  findAllWeightMeasurements,
  bulkInsertWeightMeasurements,
} from '../repositories/weightRepository.js';

export async function createWeightMeasurement(data) {
  if (!data.weight || typeof data.weight !== 'number') {
    throw new Error('Valid weight value is required');
  }

  const record = {
    id: data.id || uuidv4(),
    weight: Number(data.weight),
    ocr_confidence: Number(data.ocr_confidence ?? data.ocrConfidence ?? 1.0),
    captured_at: data.captured_at || data.timestamp || new Date().toISOString(),
  };

  const created = await insertWeightMeasurement(record);
  return created;
}

export async function getWeightMeasurementById(id) {
  const measurement = await findWeightMeasurementById(id);
  if (!measurement) {
    throw new Error(`Measurement with id ${id} not found`);
  }
  return measurement;
}

export async function getAllWeightMeasurements() {
  return findAllWeightMeasurements();
}

export async function syncWeightMeasurements(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return { synced_count: 0, synced_ids: [] };
  }

  const syncedIds = await bulkInsertWeightMeasurements(records);
  return {
    synced_count: syncedIds.length,
    synced_ids: syncedIds,
  };
}
