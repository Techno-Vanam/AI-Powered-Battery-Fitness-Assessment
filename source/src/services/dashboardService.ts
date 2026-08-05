import NetInfo from '@react-native-community/netinfo';
import { API_BASE_URL } from '../config/api';
import { getCachedData, setCachedData } from '../db/dashboardCacheRepository';

export interface CoachStats {
  active_assessments: number;
  completed_assessments: number;
  athletes_registered: number;
  pending_sync: number;
  reports_generated: number;
  avg_completion_pct: number;
}

export interface CurrentAssessment {
  id: string;
  title: string;
  class_name: string;
  student_count: number;
  completed_count: number;
  progress_percent: number;
  status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TestProgressItem {
  id: string;
  assessment_id: string;
  test_key: string;
  test_name: string;
  status: 'not_started' | 'in_progress' | 'complete';
  completed_count: number;
  total_students: number;
  best_value?: number;
  unit?: string;
  updated_at: string;
}

export interface ActivityItem {
  id: string;
  type: 'test_completed' | 'report_generated' | 'sync_completed' | 'athlete_added';
  title: string;
  description: string;
  timestamp: string;
}

export interface PendingTaskItem {
  id: string;
  type: 'pending_sync' | 'incomplete_assessment' | 'generate_report';
  title: string;
  subtitle: string;
  action_type: string;
  action_target?: string;
  created_at: string;
}

export interface AnalyticsPreview {
  avg_height: string;
  avg_weight: string;
  fastest_sprint: string;
  highest_vertical_jump: string;
  best_broad_jump: string;
  avg_sit_ups: string;
  overall_completion_pct: number;
}

const DEFAULT_COACH_ID = 'coach_101';

/**
 * Generic fetcher with offline fallback & caching
 */
async function fetchWithCache<T>(
  endpoint: string,
  cacheKey: string,
  fallbackData: T,
  timeoutMs = 2500
): Promise<{ data: T; isOffline: boolean; lastSynced?: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const net = await NetInfo.fetch();
    const isOnline = Boolean(net.isConnected && net.isInternetReachable !== false);

    if (isOnline) {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { signal: controller.signal });
      clearTimeout(timer);
      if (response.ok) {
        const body = await response.json();
        const apiData = (body.data?.assessments || body.data?.activities || body.data?.tasks || body.data?.analytics || body.data?.test_progress || body.data) as T;
        if (apiData) {
          setCachedData(cacheKey, apiData);
          return { data: apiData, isOffline: false, lastSynced: new Date().toISOString() };
        }
      }
    } else {
      clearTimeout(timer);
    }
  } catch {
    // Network request failed or timed out — fall back to cache
  }

  // Offline or network failed — load from local SQLite cache
  const cached = getCachedData<T>(cacheKey);
  if (cached) {
    return { data: cached.data, isOffline: true, lastSynced: cached.updated_at };
  }

  // First time offline fallback if nothing cached yet
  return { data: fallbackData, isOffline: true, lastSynced: undefined };
}

// ── Service Endpoints ──────────────────────────────────────────────────────────

export const INITIAL_COACH_STATS: CoachStats = {
  active_assessments: 2,
  completed_assessments: 1,
  athletes_registered: 48,
  pending_sync: 1,
  reports_generated: 12,
  avg_completion_pct: 68,
};

export const INITIAL_CURRENT_ASSESSMENTS: CurrentAssessment[] = [
  {
    id: `asm_1_${DEFAULT_COACH_ID}`,
    title: 'National Fitness Battery - Batch A',
    class_name: 'Class 10-A',
    student_count: 30,
    completed_count: 18,
    progress_percent: 60,
    status: 'in_progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: `asm_2_${DEFAULT_COACH_ID}`,
    title: 'Under-17 Talent ID Assessment',
    class_name: 'Batch U-17',
    student_count: 25,
    completed_count: 25,
    progress_percent: 100,
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_TEST_PROGRESS: TestProgressItem[] = [
  { id: 't1', assessment_id: 'asm_1', test_key: 'height', test_name: 'Height', status: 'complete', completed_count: 30, total_students: 30, best_value: 178.5, unit: 'cm', updated_at: new Date().toISOString() },
  { id: 't2', assessment_id: 'asm_1', test_key: 'weight', test_name: 'Weight', status: 'complete', completed_count: 30, total_students: 30, best_value: 68.2, unit: 'kg', updated_at: new Date().toISOString() },
  { id: 't3', assessment_id: 'asm_1', test_key: 'sit_reach', test_name: 'Sit & Reach', status: 'complete', completed_count: 30, total_students: 30, best_value: 32.0, unit: 'cm', updated_at: new Date().toISOString() },
  { id: 't4', assessment_id: 'asm_1', test_key: 'vertical_jump', test_name: 'Vertical Jump', status: 'in_progress', completed_count: 22, total_students: 30, best_value: 54.0, unit: 'cm', updated_at: new Date().toISOString() },
  { id: 't5', assessment_id: 'asm_1', test_key: 'broad_jump', test_name: 'Broad Jump', status: 'in_progress', completed_count: 18, total_students: 30, best_value: 2.15, unit: 'm', updated_at: new Date().toISOString() },
  { id: 't6', assessment_id: 'asm_1', test_key: 'med_ball_throw', test_name: 'Medicine Ball Throw', status: 'in_progress', completed_count: 14, total_students: 30, best_value: 7.8, unit: 'm', updated_at: new Date().toISOString() },
  { id: 't7', assessment_id: 'asm_1', test_key: 'sprint_30m', test_name: '30m Sprint', status: 'in_progress', completed_count: 10, total_students: 30, best_value: 4.12, unit: 's', updated_at: new Date().toISOString() },
  { id: 't8', assessment_id: 'asm_1', test_key: 'shuttle_4x10', test_name: '4×10 Shuttle Run', status: 'not_started', completed_count: 0, total_students: 30, best_value: 9.8, unit: 's', updated_at: new Date().toISOString() },
  { id: 't9', assessment_id: 'asm_1', test_key: 'sit_ups', test_name: 'Sit-Ups', status: 'not_started', completed_count: 0, total_students: 30, best_value: 45, unit: 'reps', updated_at: new Date().toISOString() },
  { id: 't10', assessment_id: 'asm_1', test_key: 'endurance_run', test_name: 'Endurance Run', status: 'not_started', completed_count: 0, total_students: 30, best_value: 2.15, unit: 'min', updated_at: new Date().toISOString() },
];

export const INITIAL_RECENT_ACTIVITIES: ActivityItem[] = [
  { id: 'act_1', type: 'test_completed', title: 'Vertical Jump test completed', description: 'Batch Class 10-A completed 22/30 student jumps', timestamp: '15 mins ago' },
  { id: 'act_2', type: 'report_generated', title: 'U-17 Talent Report Generated', description: 'Comprehensive fitness scorecard PDF exported', timestamp: '2 hours ago' },
  { id: 'act_3', type: 'sync_completed', title: 'Cloud Sync Successful', description: '14 assessment records synced to central server', timestamp: '5 hours ago' },
  { id: 'act_4', type: 'athlete_added', title: '3 New Athletes Registered', description: 'Added Rohan Sharma, Priya Verma, and Aarav Patel', timestamp: '1 day ago' },
];

export const INITIAL_PENDING_TASKS: PendingTaskItem[] = [
  { id: 'task_1', type: 'pending_sync', title: '12 Assessment Records Offline', subtitle: 'Tap to synchronize queued data with cloud server', action_type: 'sync_now', created_at: new Date().toISOString() },
  { id: 'task_2', type: 'incomplete_assessment', title: 'Finish 30m Sprint & Shuttle Run', subtitle: 'Class 10-A has 2 remaining tests pending', action_type: 'continue_assessment', created_at: new Date().toISOString() },
  { id: 'task_3', type: 'generate_report', title: 'Generate U-17 Performance Analytics', subtitle: 'Batch completed — ready for official scorecard export', action_type: 'generate_report', created_at: new Date().toISOString() },
];

export const INITIAL_ANALYTICS_PREVIEW: AnalyticsPreview = {
  avg_height: '164.2 cm',
  avg_weight: '54.8 kg',
  fastest_sprint: '4.12 s',
  highest_vertical_jump: '54.0 cm',
  best_broad_jump: '2.15 m',
  avg_sit_ups: '38 reps',
  overall_completion_pct: 74,
};

export const fetchCoachStats = async (coachId: string = DEFAULT_COACH_ID) => {
  return fetchWithCache<CoachStats>(`/coach/${coachId}/dashboard/stats`, `stats_${coachId}`, INITIAL_COACH_STATS);
};

export const fetchCurrentAssessments = async (coachId: string = DEFAULT_COACH_ID) => {
  return fetchWithCache<CurrentAssessment[]>(`/coach/${coachId}/assessments/current`, `current_${coachId}`, INITIAL_CURRENT_ASSESSMENTS);
};

export const fetchTestProgress = async (coachId: string = DEFAULT_COACH_ID, assessmentId?: string) => {
  const url = assessmentId
    ? `/coach/${coachId}/assessments/${assessmentId}/test-progress`
    : `/coach/${coachId}/assessments/test-progress`;
  return fetchWithCache<TestProgressItem[]>(url, `progress_${coachId}_${assessmentId || 'default'}`, INITIAL_TEST_PROGRESS);
};

export const fetchRecentActivity = async (coachId: string = DEFAULT_COACH_ID) => {
  return fetchWithCache<ActivityItem[]>(`/coach/${coachId}/activity/recent`, `activity_${coachId}`, INITIAL_RECENT_ACTIVITIES);
};

export const fetchPendingTasks = async (coachId: string = DEFAULT_COACH_ID) => {
  return fetchWithCache<PendingTaskItem[]>(`/coach/${coachId}/tasks/pending`, `tasks_${coachId}`, INITIAL_PENDING_TASKS);
};

export const fetchAnalyticsPreview = async (coachId: string = DEFAULT_COACH_ID) => {
  return fetchWithCache<AnalyticsPreview>(`/coach/${coachId}/analytics/preview`, `analytics_${coachId}`, INITIAL_ANALYTICS_PREVIEW);
};
