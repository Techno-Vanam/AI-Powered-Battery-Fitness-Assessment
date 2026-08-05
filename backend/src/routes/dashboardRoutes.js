import { Router } from 'express';
import {
  getStats,
  getCurrentAssessments,
  getTestProgress,
  getRecentActivity,
  getPendingTasks,
  getAnalyticsPreview,
} from '../controllers/dashboardController.js';

const router = Router();

// GET /api/coach/:coachId/dashboard/stats
router.get('/:coachId/dashboard/stats', getStats);

// GET /api/coach/:coachId/assessments/current
router.get('/:coachId/assessments/current', getCurrentAssessments);

// GET /api/coach/:coachId/assessments/:assessmentId/test-progress
router.get('/:coachId/assessments/:assessmentId/test-progress', getTestProgress);

// GET /api/coach/:coachId/assessments/test-progress (default active assessment)
router.get('/:coachId/assessments/test-progress', getTestProgress);

// GET /api/coach/:coachId/activity/recent
router.get('/:coachId/activity/recent', getRecentActivity);

// GET /api/coach/:coachId/tasks/pending
router.get('/:coachId/tasks/pending', getPendingTasks);

// GET /api/coach/:coachId/analytics/preview
router.get('/:coachId/analytics/preview', getAnalyticsPreview);

export default router;
