import { Router } from 'express';
import authRoutes from './authRoutes.js';
import syncRoutes from './syncRoutes.js';
import testRoutes from './testRoutes.js';
import { athleteRouter } from './heightRoutes.js';

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
router.use('/athletes', athleteRouter);
router.use('/tests', testRoutes);

export default router;
