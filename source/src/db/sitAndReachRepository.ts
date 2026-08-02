import { open } from '@op-engineering/op-sqlite';

const db = open({ name: 'SportsApp.db' });

export interface PendingSitAndReach {
  local_id: string;
  action: 'create' | 'correct';
  correction_of_id: number | null;
  athlete_id: number;
  trial_1: number;
  trial_2: number;
  trial_3: number;
  notes: string | null;
  session_date: string;
  created_at: string;
  sync_status: 'pending' | 'syncing' | 'failed';
}

export const queueCreate = async (params: {
  localId: string;
  athleteId: number;
  trials: [number, number, number];
  notes?: string;
  sessionDate: string;
}): Promise<void> => {
  await db.execute(
    `INSERT INTO pending_sit_and_reach
     (local_id, action, athlete_id, trial_1, trial_2, trial_3, notes, session_date, created_at)
     VALUES (?, 'create', ?, ?, ?, ?, ?, ?, ?)`,
    [params.localId, params.athleteId, params.trials[0], params.trials[1], params.trials[2],
     params.notes ?? null, params.sessionDate, new Date().toISOString()]
  );
};

export const queueCorrection = async (params: {
  localId: string;
  correctionOfId: number;
  athleteId: number;
  trials: [number, number, number];
  notes?: string;
  sessionDate: string;
}): Promise<void> => {
  await db.execute(
    `INSERT INTO pending_sit_and_reach
     (local_id, action, correction_of_id, athlete_id, trial_1, trial_2, trial_3, notes, session_date, created_at)
     VALUES (?, 'correct', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [params.localId, params.correctionOfId, params.athleteId, params.trials[0], params.trials[1], params.trials[2],
     params.notes ?? null, params.sessionDate, new Date().toISOString()]
  );
};

export const getPending = async (): Promise<PendingSitAndReach[]> => {
  const { rows } = await db.execute(
    `SELECT * FROM pending_sit_and_reach WHERE sync_status != 'syncing'`
  );
  const items = (rows as any)?._array ?? rows ?? [];
  return items as PendingSitAndReach[];
};

export const markSyncing = (localId: string) =>
  db.execute(`UPDATE pending_sit_and_reach SET sync_status = 'syncing' WHERE local_id = ?`, [localId]);

export const markFailed = (localId: string) =>
  db.execute(`UPDATE pending_sit_and_reach SET sync_status = 'failed' WHERE local_id = ?`, [localId]);

export const removeFromQueue = (localId: string) =>
  db.execute(`DELETE FROM pending_sit_and_reach WHERE local_id = ?`, [localId]);

export const countPending = async (): Promise<number> => {
  const { rows } = await db.execute(`SELECT COUNT(*) as count FROM pending_sit_and_reach`);
  const items = (rows as any)?._array ?? rows ?? [];
  return (items[0]?.count as number) ?? 0;
};

