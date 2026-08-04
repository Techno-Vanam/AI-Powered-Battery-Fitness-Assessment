import { Router } from 'express';
import authRoutes from './authRoutes.js';
import syncRoutes from './syncRoutes.js';
import weightRoutes from './weightRoutes.js';

const router = Router();

// Health check — always responds even if DB is slow
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running.', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/sync', syncRoutes);
router.use('/weight-measurements', weightRoutes);

export default router;

