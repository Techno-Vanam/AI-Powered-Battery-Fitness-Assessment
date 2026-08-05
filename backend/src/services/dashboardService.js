import * as dashboardRepo from '../repositories/dashboardRepository.js';

export async function getStats(coachId) {
  return dashboardRepo.getCoachStats(coachId);
}

export async function getCurrentAssessments(coachId) {
  return dashboardRepo.getCurrentAssessments(coachId);
}

export async function getTestProgress(coachId, assessmentId) {
  return dashboardRepo.getTestProgress(coachId, assessmentId);
}

export async function getRecentActivity(coachId, limit) {
  return dashboardRepo.getRecentActivity(coachId, limit);
}

export async function getPendingTasks(coachId) {
  return dashboardRepo.getPendingTasks(coachId);
}

export async function getAnalyticsPreview(coachId) {
  return dashboardRepo.getAnalyticsPreview(coachId);
}
