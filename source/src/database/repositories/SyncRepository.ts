import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';

export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SyncQueueItem {
  id: string;
  tableName: string;
  recordId: string;
  operation: SyncOperation;
  retryCount: number;
  lastAttempt: number | null;
  createdAt: number;
}

const MAX_RETRIES = 5;

function rowToItem(row: any): SyncQueueItem {
  return {
    id: row.id,
    tableName: row.tableName,
    recordId: row.recordId,
    operation: row.operation as SyncOperation,
    retryCount: row.retryCount,
    lastAttempt: row.lastAttempt ?? null,
    createdAt: row.createdAt,
  };
}

export const SyncRepository = {
  async enqueue(
    tableName: string,
    recordId: string,
    operation: SyncOperation = 'INSERT',
  ): Promise<SyncQueueItem> {
    const db = getDatabase();
    const id = uuidv4();
    const now = Date.now();
    await db.executeSql(
      `INSERT INTO sync_queue (id, tableName, recordId, operation, retryCount, lastAttempt, createdAt)
       VALUES (?, ?, ?, ?, 0, NULL, ?);`,
      [id, tableName, recordId, operation, now],
    );
    return { id, tableName, recordId, operation, retryCount: 0, lastAttempt: null, createdAt: now };
  },

  async getPending(): Promise<SyncQueueItem[]> {
    const db = getDatabase();
    const [res] = await db.executeSql(
      `SELECT * FROM sync_queue
       WHERE retryCount < ?
       ORDER BY
         CASE tableName
           WHEN 'athletes'     THEN 1
           WHEN 'height_tests' THEN 2
           WHEN 'videos'       THEN 3
           ELSE 4
         END,
         createdAt ASC;`,
      [MAX_RETRIES],
    );
    const items: SyncQueueItem[] = [];
    for (let i = 0; i < res.rows.length; i++) items.push(rowToItem(res.rows.item(i)));
    return items;
  },

  async incrementRetry(id: string): Promise<void> {
    const db = getDatabase();
    await db.executeSql(
      'UPDATE sync_queue SET retryCount = retryCount + 1, lastAttempt = ? WHERE id = ?;',
      [Date.now(), id],
    );
  },

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.executeSql('DELETE FROM sync_queue WHERE id = ?;', [id]);
  },

  async deleteByRecord(tableName: string, recordId: string): Promise<void> {
    const db = getDatabase();
    await db.executeSql(
      'DELETE FROM sync_queue WHERE tableName = ? AND recordId = ?;',
      [tableName, recordId],
    );
  },

  async countPending(): Promise<number> {
    const db = getDatabase();
    const [res] = await db.executeSql(
      'SELECT COUNT(*) as cnt FROM sync_queue WHERE retryCount < ?;',
      [MAX_RETRIES],
    );
    return res.rows.item(0).cnt as number;
  },

  async purgeFailed(): Promise<void> {
    const db = getDatabase();
    await db.executeSql('DELETE FROM sync_queue WHERE retryCount >= ?;', [MAX_RETRIES]);
  },
};
