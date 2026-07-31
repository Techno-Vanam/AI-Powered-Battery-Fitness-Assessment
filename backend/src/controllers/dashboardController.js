import * as dashboardService from '../services/dashboardService.js';
import { sendSuccess } from '../utils/response.js';

export async function getStats(req, res, next) {
  try {
    const coachId = req.params.coachId || 'coach_default';
    const stats = await dashboardService.getStats(coachId);
    return sendSuccess(res, 'Dashboard statistics retrieved successfully.', stats);
  } catch (err) {
    next(err);
  }
}

export async function getCurrentAssessments(req, res, next) {
  try {
    const coachId = req.params.coachId || 'coach_default';
    const assessments = await dashboardService.getCurrentAssessments(coachId);
    return sendSuccess(res, 'Current assessments retrieved successfully.', { assessments });
  } catch (err) {
    next(err);
  }
}

export async function getTestProgress(req, res, next) {
  try {
    const coachId = req.params.coachId || 'coach_default';
    const assessmentId = req.params.assessmentId;
    const testProgress = await dashboardService.getTestProgress(coachId, assessmentId);
    return sendSuccess(res, 'Test progress breakdown retrieved successfully.', { test_progress: testProgress });
  } catch (err) {
    next(err);
  }
}

export async function getRecentActivity(req, res, next) {
  try {
    const coachId = req.params.coachId || 'coach_default';
    const limit = parseInt(req.query.limit, 10) || 10;
    const activities = await dashboardService.getRecentActivity(coachId, limit);
    return sendSuccess(res, 'Recent activity log retrieved successfully.', { activities });
  } catch (err) {
    next(err);
  }
}

export async function getPendingTasks(req, res, next) {
  try {
    const coachId = req.params.coachId || 'coach_default';
    const tasks = await dashboardService.getPendingTasks(coachId);
    return sendSuccess(res, 'Pending tasks retrieved successfully.', { tasks });
  } catch (err) {
    next(err);
  }
}

export async function getAnalyticsPreview(req, res, next) {
  try {
    const coachId = req.params.coachId || 'coach_default';
    const analytics = await dashboardService.getAnalyticsPreview(coachId);
    return sendSuccess(res, 'Analytics preview retrieved successfully.', { analytics });
  } catch (err) {
    next(err);
  }
}
