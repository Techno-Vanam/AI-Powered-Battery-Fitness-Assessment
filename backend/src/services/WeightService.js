const weightRepository = require('./WeightRepository');
const logger = require('../utils/logger');

class WeightService {
  async createMeasurement(data) {
    logger.info(`Creating weight measurement: ${data.weight}kg`);
    return await weightRepository.create(data);
  }

  async getMeasurementById(id) {
    const record = await weightRepository.findById(id);
    if (!record) {
      const error = new Error(`Weight measurement with ID '${id}' not found.`);
      error.statusCode = 404;
      throw error;
    }
    return record;
  }

  async getAllMeasurements(options) {
    return await weightRepository.findAll(options);
  }

  async syncMeasurements(measurements) {
    logger.info(`Processing bulk sync for ${measurements.length} weight measurements.`);
    const saved = await weightRepository.createBulk(measurements);
    return {
      syncedCount: saved.length,
      syncedRecords: saved
    };
  }

  async deleteMeasurement(id) {
    const success = await weightRepository.deleteById(id);
    if (!success) {
      const error = new Error(`Weight measurement with ID '${id}' not found or could not be deleted.`);
      error.statusCode = 404;
      throw error;
    }
    return { id, deleted: true };
  }
}

module.exports = new WeightService();
