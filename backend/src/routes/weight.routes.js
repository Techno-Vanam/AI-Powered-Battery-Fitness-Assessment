const express = require('express');
const weightController = require('../controllers/WeightController');
const { validateWeightMeasurement, validateSyncPayload } = require('../middleware/validation.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// REST API Endpoints

/**
 * POST /api/weight-measurements
 * Create single measurement (supports optional file upload)
 */
router.post(
  '/',
  upload.single('image'),
  validateWeightMeasurement,
  (req, res, next) => weightController.createMeasurement(req, res, next)
);

/**
 * GET /api/weight-measurements
 * Retrieve list of measurements
 */
router.get(
  '/',
  (req, res, next) => weightController.getAllMeasurements(req, res, next)
);

/**
 * GET /api/weight-measurements/:id
 * Retrieve measurement by ID
 */
router.get(
  '/:id',
  (req, res, next) => weightController.getMeasurementById(req, res, next)
);

/**
 * POST /api/weight-measurements/sync
 * Bulk upload offline measurements
 */
router.post(
  '/sync',
  validateSyncPayload,
  (req, res, next) => weightController.syncMeasurements(req, res, next)
);

/**
 * DELETE /api/weight-measurements/:id
 * Delete measurement by ID
 */
router.delete(
  '/:id',
  (req, res, next) => weightController.deleteMeasurement(req, res, next)
);

module.exports = router;
