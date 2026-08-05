import { Router } from 'express';
import authRoutes from './authRoutes.js';
import syncRoutes from './syncRoutes.js';
import weightRoutes from './weightRoutes.js';
import testRoutes from './testRoutes.js';
import { athleteRouter } from './heightRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    serverTime: Date.now(),
    message: 'Server is running.',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/sync', syncRoutes);
router.use('/weight-measurements', weightRoutes);
router.use('/athletes', athleteRouter);
router.use('/tests', testRoutes);
router.use('/coach', dashboardRoutes);

// Public report download endpoint — scanned from QR code on report card
router.use('/report', reportRoutes);

export default router;
