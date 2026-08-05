import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';
import type { SyncStatus } from './HeightRepository';

export interface VideoRecord {
  id: string;
  athleteId: string;
  localPath: string;
  thumbnailPath: string | null;
  duration: number;
  fileSize: number;
  createdAt: number;
  syncStatus: SyncStatus;
}

export type VideoInput = Omit<VideoRecord, 'id' | 'createdAt' | 'syncStatus'>;

function rowToVideo(row: any): VideoRecord {
  return {
    id: row.id,
    athleteId: row.athleteId,
    localPath: row.localPath,
    thumbnailPath: row.thumbnailPath ?? null,
    duration: row.duration,
    fileSize: row.fileSize,
    createdAt: row.createdAt,
    syncStatus: row.syncStatus as SyncStatus,
  };
}

export const VideoRepository = {
  async insert(input: VideoInput): Promise<VideoRecord> {
    const db = getDatabase();
    const id = uuidv4();
    const now = Date.now();
    await db.executeSql(
      `INSERT INTO videos
         (id, athleteId, localPath, thumbnailPath, duration, fileSize, createdAt, syncStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending');`,
      [id, input.athleteId, input.localPath, input.thumbnailPath, input.duration, input.fileSize, now],
    );
    return { id, ...input, createdAt: now, syncStatus: 'pending' };
  },

  async findById(id: string): Promise<VideoRecord | null> {
    const db = getDatabase();
    const [res] = await db.executeSql('SELECT * FROM videos WHERE id = ?;', [id]);
    if (res.rows.length === 0) return null;
    return rowToVideo(res.rows.item(0));
  },

  async getPending(): Promise<VideoRecord[]> {
    const db = getDatabase();
    const [res] = await db.executeSql(
      "SELECT * FROM videos WHERE syncStatus IN ('pending','failed','retrying') ORDER BY createdAt ASC;",
    );
    const rows: VideoRecord[] = [];
    for (let i = 0; i < res.rows.length; i++) rows.push(rowToVideo(res.rows.item(i)));
    return rows;
  },

  async updateSyncStatus(id: string, status: SyncStatus): Promise<void> {
    const db = getDatabase();
    await db.executeSql('UPDATE videos SET syncStatus = ? WHERE id = ?;', [status, id]);
  },

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.executeSql('DELETE FROM videos WHERE id = ?;', [id]);
  },
};
