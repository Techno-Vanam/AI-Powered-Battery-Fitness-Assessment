import { Router } from 'express';
import {
  uploadMeasurement,
  fetchMeasurements,
  fetchMeasurementById,
  syncMeasurements,
} from '../controllers/weightController.js';

const router = Router();

// POST /api/weight-measurements — Upload single measurement
router.post('/', uploadMeasurement);

// GET /api/weight-measurements — Fetch all measurements
router.get('/', fetchMeasurements);

// GET /api/weight-measurements/:id — Fetch single measurement
router.get('/:id', fetchMeasurementById);

// POST /api/weight-measurements/sync — Bulk upload pending offline measurements
router.post('/sync', syncMeasurements);

export default router;
