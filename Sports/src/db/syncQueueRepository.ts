import { getDBConnection } from './schema';

export interface SyncQueueItem {
  queue_id: number;
  entity_type: string;
  entity_local_id: string;
  operation: 'INSERT' | 'UPDATE';
  payload: string;
  created_at: string;
  attempts: number;
}

export const getAllPendingSync = (): SyncQueueItem[] => {
  const db = getDBConnection();
  const result = db.execute(`SELECT * FROM sync_queue ORDER BY created_at ASC`);
  const items: SyncQueueItem[] = [];
  if (result.rows) {
    for (let i = 0; i < result.rows.length; i++) {
      items.push(result.rows.item(i) as SyncQueueItem);
    }
  }
  return items;
};

export const incrementAttempts = (queue_id: number): void => {
  const db = getDBConnection();
  db.execute(
    `UPDATE sync_queue SET attempts = attempts + 1 WHERE queue_id = ?`,
    [queue_id]
  );
};

export const removeSyncItem = (queue_id: number): void => {
  const db = getDBConnection();
  db.execute(`DELETE FROM sync_queue WHERE queue_id = ?`, [queue_id]);
};

export const markUserSynced = (local_id: string, server_id: string): void => {
  const db = getDBConnection();
  const now = new Date().toISOString();
  db.execute(
    `UPDATE users SET server_id = ?, sync_status = 'synced', updated_at = ? WHERE local_id = ?`,
    [server_id, now, local_id]
  );
};
