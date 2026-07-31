const weightService = require('../services/WeightService');
const ApiResponse = require('../utils/response');

class WeightController {
  /**
   * POST /api/weight-measurements
   */
  async createMeasurement(req, res, next) {
    try {
      const data = {
        id: req.body.id,
        weight: req.body.weight,
        ocr_confidence: req.body.ocr_confidence || req.body.ocrConfidence,
        captured_at: req.body.captured_at || req.body.capturedAt || req.body.timestamp || new Date().toISOString()
      };
      const result = await weightService.createMeasurement(data);
      return ApiResponse.success(res, result, 'Weight measurement recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/weight-measurements
   */
  async getAllMeasurements(req, res, next) {
    try {
      const limit = parseInt(req.query.limit || '50', 10);
      const offset = parseInt(req.query.offset || '0', 10);
      const results = await weightService.getAllMeasurements({ limit, offset });
      return ApiResponse.success(res, results, 'Weight measurements retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/weight-measurements/:id
   */
  async getMeasurementById(req, res, next) {
    try {
      const result = await weightService.getMeasurementById(req.params.id);
      return ApiResponse.success(res, result, 'Weight measurement retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/weight-measurements/sync
   */
  async syncMeasurements(req, res, next) {
    try {
      const { measurements } = req.body;
      const result = await weightService.syncMeasurements(measurements);
      return ApiResponse.success(res, result, `${result.syncedCount} measurements synchronized successfully`, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/weight-measurements/:id
   */
  async deleteMeasurement(req, res, next) {
    try {
      const result = await weightService.deleteMeasurement(req.params.id);
      return ApiResponse.success(res, result, 'Weight measurement deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WeightController();
