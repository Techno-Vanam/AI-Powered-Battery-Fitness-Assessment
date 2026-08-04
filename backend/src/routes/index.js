import { Router } from 'express';
import authRoutes from './authRoutes.js';
import syncRoutes from './syncRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

// Health check — always responds even if DB is slow
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running.', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/sync', syncRoutes);
router.use('/coach', dashboardRoutes);

// Public report download endpoint — scanned from QR code on report card
// GET /api/report/:athleteId?assessmentId=...
router.use('/report', reportRoutes);

export default router;
