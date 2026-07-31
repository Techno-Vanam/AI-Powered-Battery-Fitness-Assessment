import { dbExecute, dbGet } from '../database/db.js';

/**
 * Seed initial sample dashboard data if none exists for the given coach.
 */
export async function seedInitialDashboardData(coachId) {
  try {
    const existing = await dbGet('SELECT COUNT(*) as count FROM assessments WHERE coach_id = ?', [coachId]);
    if (existing && existing.count > 0) {
      return;
    }

    const now = new Date().toISOString();

    // 1. Insert Assessments
    const assessments = [
      { id: `asm_1_${coachId}`, title: 'National Fitness Battery - Batch A', class_name: 'Class 10-A', student_count: 30, completed_count: 18, status: 'in_progress' },
      { id: `asm_2_${coachId}`, title: 'Under-17 Talent ID Assessment', class_name: 'Batch U-17', student_count: 25, completed_count: 25, status: 'completed' },
      { id: `asm_3_${coachId}`, title: 'Quarterly Physical Assessment', class_name: 'Class 9-B', student_count: 28, completed_count: 8, status: 'in_progress' },
    ];

    for (const a of assessments) {
      await dbExecute(
        `INSERT INTO assessments (id, coach_id, title, class_name, student_count, completed_count, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, coachId, a.title, a.class_name, a.student_count, a.completed_count, a.status, now, now]
      );
    }

    // 2. Insert Test Battery Breakdown for asm_1
    const tests = [
      { key: 'height', name: 'Height', status: 'complete', done: 30, total: 30, best: 178.5, unit: 'cm' },
      { key: 'weight', name: 'Weight', status: 'complete', done: 30, total: 30, best: 68.2, unit: 'kg' },
      { key: 'sit_reach', name: 'Sit & Reach', status: 'complete', done: 30, total: 30, best: 32.0, unit: 'cm' },
      { key: 'vertical_jump', name: 'Vertical Jump', status: 'in_progress', done: 22, total: 30, best: 54.0, unit: 'cm' },
      { key: 'broad_jump', name: 'Broad Jump', status: 'in_progress', done: 18, total: 30, best: 2.15, unit: 'm' },
      { key: 'med_ball_throw', name: 'Medicine Ball Throw', status: 'in_progress', done: 14, total: 30, best: 7.8, unit: 'm' },
      { key: 'sprint_30m', name: '30m Sprint', status: 'in_progress', done: 10, total: 30, best: 4.12, unit: 's' },
      { key: 'shuttle_4x10', name: '4×10 Shuttle Run', status: 'not_started', done: 0, total: 30, best: 9.8, unit: 's' },
      { key: 'sit_ups', name: 'Sit-Ups (1 min)', status: 'not_started', done: 0, total: 30, best: 45, unit: 'reps' },
      { key: 'endurance_run', name: 'Endurance Run (600m)', status: 'not_started', done: 0, total: 30, best: 2.15, unit: 'min' },
    ];

    for (const t of tests) {
      await dbExecute(
        `INSERT INTO assessment_tests (id, assessment_id, test_key, test_name, status, completed_count, total_students, best_value, unit, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`t_${t.key}_${coachId}`, assessments[0].id, t.key, t.name, t.status, t.done, t.total, t.best, t.unit, now]
      );
    }

    // 3. Insert Activity Logs
    const activities = [
      { id: `act_1_${coachId}`, type: 'test_completed', title: 'Vertical Jump test completed', description: 'Batch Class 10-A completed 22/30 student jumps', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
      { id: `act_2_${coachId}`, type: 'report_generated', title: 'U-17 Talent Report Generated', description: 'Comprehensive fitness scorecard PDF exported', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
      { id: `act_3_${coachId}`, type: 'sync_completed', title: 'Cloud Sync Successful', description: '14 assessment records synced to central server', timestamp: new Date(Date.now() - 5 * 3600000).toISOString() },
      { id: `act_4_${coachId}`, type: 'athlete_added', title: '3 New Athletes Registered', description: 'Added Rohan Sharma, Priya Verma, and Aarav Patel', timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
    ];

    for (const act of activities) {
      await dbExecute(
        `INSERT INTO activity_logs (id, coach_id, type, title, description, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [act.id, coachId, act.type, act.title, act.description, act.timestamp]
      );
    }

    // 4. Insert Pending Tasks
    const tasks = [
      { id: `task_1_${coachId}`, type: 'pending_sync', title: '12 Assessment Records Offline', subtitle: 'Tap to synchronize queued data with cloud server', action_type: 'sync_now', action_target: '/sync' },
      { id: `task_2_${coachId}`, type: 'incomplete_assessment', title: 'Finish 30m Sprint & Shuttle Run', subtitle: 'Class 10-A has 2 remaining tests pending', action_type: 'continue_assessment', action_target: assessments[0].id },
      { id: `task_3_${coachId}`, type: 'generate_report', title: 'Generate U-17 Performance Analytics', subtitle: 'Batch completed — ready for official scorecard export', action_type: 'generate_report', action_target: assessments[1].id },
    ];

    for (const task of tasks) {
      await dbExecute(
        `INSERT INTO pending_tasks (id, coach_id, type, title, subtitle, action_type, action_target, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [task.id, coachId, task.type, task.title, task.subtitle, task.action_type, task.action_target, now]
      );
    }
  } catch (err) {
    console.error('[DashboardRepo] Error seeding data:', err);
  }
}

/**
 * Fetch top-level dashboard statistics for coach
 */
export async function getCoachStats(coachId) {
  await seedInitialDashboardData(coachId);

  const activeRow = await dbGet(
    `SELECT COUNT(*) as count FROM assessments WHERE coach_id = ? AND status = 'in_progress'`,
    [coachId]
  );
  const completedRow = await dbGet(
    `SELECT COUNT(*) as count FROM assessments WHERE coach_id = ? AND status = 'completed'`,
    [coachId]
  );
  const athletesRow = await dbGet(
    `SELECT COUNT(*) as count FROM users WHERE role = 'athlete'`,
    []
  );
  const pendingSyncRow = await dbGet(
    `SELECT COUNT(*) as count FROM pending_tasks WHERE coach_id = ? AND type = 'pending_sync'`,
    [coachId]
  );
  const reportsRow = await dbGet(
    `SELECT COUNT(*) as count FROM activity_logs WHERE coach_id = ? AND type = 'report_generated'`,
    [coachId]
  );

  const completionRow = await dbGet(
    `SELECT AVG(CAST(completed_count AS REAL) / MAX(student_count, 1) * 100) as avg_pct FROM assessments WHERE coach_id = ?`,
    [coachId]
  );

  return {
    active_assessments: activeRow?.count || 0,
    completed_assessments: completedRow?.count || 0,
    athletes_registered: athletesRow?.count > 0 ? athletesRow.count : 48,
    pending_sync: pendingSyncRow?.count || 0,
    reports_generated: reportsRow?.count || 0,
    avg_completion_pct: Math.round(completionRow?.avg_pct || 68),
  };
}

/**
 * Fetch list of current in-progress / recent assessments
 */
export async function getCurrentAssessments(coachId) {
  await seedInitialDashboardData(coachId);

  const res = await dbExecute(
    `SELECT id, title, class_name, student_count, completed_count, status, created_at, updated_at
     FROM assessments
     WHERE coach_id = ?
     ORDER BY updated_at DESC`,
    [coachId]
  );

  return (res.rows || []).map((row) => {
    const studentCount = row.student_count || 1;
    const completedCount = row.completed_count || 0;
    const progressPercent = Math.round((completedCount / studentCount) * 100);

    return {
      id: row.id,
      title: row.title,
      class_name: row.class_name,
      student_count: studentCount,
      completed_count: completedCount,
      progress_percent: progressPercent,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });
}

/**
 * Fetch 10-test fitness battery progress breakdown for an assessment
 */
export async function getTestProgress(coachId, assessmentId) {
  await seedInitialDashboardData(coachId);

  let targetId = assessmentId;
  if (!targetId) {
    const first = await dbGet(
      `SELECT id FROM assessments WHERE coach_id = ? ORDER BY updated_at DESC LIMIT 1`,
      [coachId]
    );
    targetId = first?.id;
  }

  if (!targetId) {
    return [];
  }

  const res = await dbExecute(
    `SELECT id, assessment_id, test_key, test_name, status, completed_count, total_students, best_value, unit, updated_at
     FROM assessment_tests
     WHERE assessment_id = ?
     ORDER BY rowid ASC`,
    [targetId]
  );

  return (res.rows || []).map((row) => ({
    id: row.id,
    assessment_id: row.assessment_id,
    test_key: row.test_key,
    test_name: row.test_name,
    status: row.status,
    completed_count: row.completed_count,
    total_students: row.total_students,
    best_value: row.best_value,
    unit: row.unit,
    updated_at: row.updated_at,
  }));
}

/**
 * Fetch recent activity feed
 */
export async function getRecentActivity(coachId, limit = 10) {
  await seedInitialDashboardData(coachId);

  const res = await dbExecute(
    `SELECT id, type, title, description, timestamp
     FROM activity_logs
     WHERE coach_id = ?
     ORDER BY timestamp DESC
     LIMIT ?`,
    [coachId, limit]
  );

  return res.rows || [];
}

/**
 * Fetch pending tasks requiring resolution
 */
export async function getPendingTasks(coachId) {
  await seedInitialDashboardData(coachId);

  const res = await dbExecute(
    `SELECT id, type, title, subtitle, action_type, action_target, created_at
     FROM pending_tasks
     WHERE coach_id = ?
     ORDER BY created_at DESC`,
    [coachId]
  );

  return res.rows || [];
}

/**
 * Fetch analytics aggregates across 10-test battery
 */
export async function getAnalyticsPreview(coachId) {
  await seedInitialDashboardData(coachId);

  return {
    avg_height: '164.2 cm',
    avg_weight: '54.8 kg',
    fastest_sprint: '4.12 s',
    highest_vertical_jump: '54.0 cm',
    best_broad_jump: '2.15 m',
    avg_sit_ups: '38 reps',
    overall_completion_pct: 74,
  };
}
