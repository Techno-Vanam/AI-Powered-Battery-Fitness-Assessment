import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';

export type SyncStatus = 'pending' | 'uploading' | 'uploaded' | 'failed' | 'retrying';

export interface HeightTest {
  id: string;
  athleteId: string;
  heightCm: number;
  heightPixels: number;
  markerScale: number;
  markerConfidence: number;
  poseConfidence: number;
  overallConfidence: number;
  deviceId: string;
  createdAt: number;
  syncStatus: SyncStatus;
}

export type HeightTestInput = Omit<HeightTest, 'id' | 'createdAt' | 'syncStatus'>;

function rowToHeightTest(row: any): HeightTest {
  return {
    id: row.id,
    athleteId: row.athleteId,
    heightCm: row.heightCm,
    heightPixels: row.heightPixels,
    markerScale: row.markerScale,
    markerConfidence: row.markerConfidence,
    poseConfidence: row.poseConfidence,
    overallConfidence: row.overallConfidence,
    deviceId: row.deviceId,
    createdAt: row.createdAt,
    syncStatus: row.syncStatus as SyncStatus,
  };
}

export const HeightRepository = {
  async insert(input: HeightTestInput): Promise<HeightTest> {
    const db = getDatabase();
    const id = uuidv4();
    const now = Date.now();
    await db.executeSql(
      `INSERT INTO height_tests
         (id, athleteId, heightCm, heightPixels, markerScale, markerConfidence,
          poseConfidence, overallConfidence, deviceId, createdAt, syncStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending');`,
      [
        id, input.athleteId, input.heightCm, input.heightPixels,
        input.markerScale, input.markerConfidence, input.poseConfidence,
        input.overallConfidence, input.deviceId, now,
      ],
    );
    return { id, ...input, createdAt: now, syncStatus: 'pending' };
  },

  async findById(id: string): Promise<HeightTest | null> {
    const db = getDatabase();
    const [res] = await db.executeSql('SELECT * FROM height_tests WHERE id = ?;', [id]);
    if (res.rows.length === 0) return null;
    return rowToHeightTest(res.rows.item(0));
  },

  async getByAthlete(athleteId: string): Promise<HeightTest[]> {
    const db = getDatabase();
    const [res] = await db.executeSql(
      'SELECT * FROM height_tests WHERE athleteId = ? ORDER BY createdAt DESC;',
      [athleteId],
    );
    const rows: HeightTest[] = [];
    for (let i = 0; i < res.rows.length; i++) rows.push(rowToHeightTest(res.rows.item(i)));
    return rows;
  },

  async getAll(limit = 200, offset = 0): Promise<HeightTest[]> {
    const db = getDatabase();
    const [res] = await db.executeSql(
      'SELECT * FROM height_tests ORDER BY createdAt DESC LIMIT ? OFFSET ?;',
      [limit, offset],
    );
    const rows: HeightTest[] = [];
    for (let i = 0; i < res.rows.length; i++) rows.push(rowToHeightTest(res.rows.item(i)));
    return rows;
  },

  async getPending(): Promise<HeightTest[]> {
    const db = getDatabase();
    const [res] = await db.executeSql(
      "SELECT * FROM height_tests WHERE syncStatus IN ('pending','failed','retrying') ORDER BY createdAt ASC;",
    );
    const rows: HeightTest[] = [];
    for (let i = 0; i < res.rows.length; i++) rows.push(rowToHeightTest(res.rows.item(i)));
    return rows;
  },

  async updateSyncStatus(id: string, status: SyncStatus): Promise<void> {
    const db = getDatabase();
    await db.executeSql(
      'UPDATE height_tests SET syncStatus = ? WHERE id = ?;',
      [status, id],
    );
  },

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.executeSql('DELETE FROM height_tests WHERE id = ?;', [id]);
  },
};
