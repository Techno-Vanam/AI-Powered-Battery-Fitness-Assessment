import {
  saveWeightMeasurement,
  getPendingWeightMeasurements,
  getPendingWeightCount,
  getLastWeightMeasurement,
  updateWeightSyncStatus,
  deleteWeightMeasurement,
  WeightMeasurementRecord,
} from '../db/weightMeasurementsRepository';

export const SQLiteService = {
  saveMeasurement: saveWeightMeasurement,
  getPendingMeasurements: getPendingWeightMeasurements,
  getPendingCount: getPendingWeightCount,
  getLastMeasurement: getLastWeightMeasurement,
  updateSyncStatus: updateWeightSyncStatus,
  deleteMeasurement: deleteWeightMeasurement,
};

export type { WeightMeasurementRecord };
