import { getDatabase } from '../database';
import { v4 as uuidv4 } from 'uuid';

export type SyncStatus = 'pending' | 'uploading' | 'uploaded' | 'failed' | 'retrying';

export interface HeightTest {
  /** Client-generated UUID — idempotent sync key. */
  measurementId: string;
  athleteId: string;
  teamId: string | null;
  sessionId: string | null;
  heightCm: number;
  confidence: number;
  deviceModel: string;
  timestamp: number;
  calibrationMethod: string;
  stableFrameCount: number;
  videoDurationSec: number;
  pixelsPerCm: number;
  syncStatus: SyncStatus;
}

export type HeightTestInput = Omit<HeightTest, 'syncStatus'>;

function rowToHeightTest(row: any): HeightTest {
  return {
    measurementId: row.measurementId,
    athleteId: row.athleteId,
    teamId: row.teamId ?? null,
    sessionId: row.sessionId ?? null,
    heightCm: row.heightCm,
    confidence: row.confidence,
    deviceModel: row.deviceModel,
    timestamp: row.timestamp,
    calibrationMethod: row.calibrationMethod,
    stableFrameCount: row.stableFrameCount ?? 0,
    videoDurationSec: row.videoDurationSec ?? 0,
    pixelsPerCm: row.pixelsPerCm ?? 0,
    syncStatus: row.syncStatus as SyncStatus,
  };
}

export const HeightRepository = {
  async insert(input: HeightTestInput): Promise<HeightTest> {
    const db = getDatabase();
    const measurementId = input.measurementId || uuidv4();
    await db.executeSql(
      `INSERT INTO height_tests
         (measurementId, athleteId, teamId, sessionId, heightCm, confidence,
          deviceModel, timestamp, calibrationMethod, stableFrameCount,
          videoDurationSec, pixelsPerCm, syncStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending');`,
      [
        measurementId,
        input.athleteId,
        input.teamId,
        input.sessionId,
        input.heightCm,
        input.confidence,
        input.deviceModel,
        input.timestamp,
        input.calibrationMethod,
        input.stableFrameCount,
        input.videoDurationSec,
        input.pixelsPerCm,
      ],
    );
    return { ...input, measurementId, syncStatus: 'pending' };
  },

  async findById(measurementId: string): Promise<HeightTest | null> {
    const db = getDatabase();
    const [res] = await db.executeSql(
      'SELECT * FROM height_tests WHERE measurementId = ?;',
      [measurementId],
    );
    if (res.rows.length === 0) return null;
    return rowToHeightTest(res.rows.item(0));
  },

  async getByAthlete(athleteId: string): Promise<HeightTest[]> {
    const db = getDatabase();
    const [res] = await db.executeSql(
      'SELECT * FROM height_tests WHERE athleteId = ? ORDER BY timestamp DESC;',
      [athleteId],
    );
    const rows: HeightTest[] = [];
    for (let i = 0; i < res.rows.length; i++) rows.push(rowToHeightTest(res.rows.item(i)));
    return rows;
  },

  async getAll(limit = 200, offset = 0): Promise<HeightTest[]> {
    const db = getDatabase();
    const [res] = await db.executeSql(
      'SELECT * FROM height_tests ORDER BY timestamp DESC LIMIT ? OFFSET ?;',
      [limit, offset],
    );
    const rows: HeightTest[] = [];
    for (let i = 0; i < res.rows.length; i++) rows.push(rowToHeightTest(res.rows.item(i)));
    return rows;
  },

  async getPending(): Promise<HeightTest[]> {
    const db = getDatabase();
    const [res] = await db.executeSql(
      "SELECT * FROM height_tests WHERE syncStatus IN ('pending','failed','retrying') ORDER BY timestamp ASC;",
    );
    const rows: HeightTest[] = [];
    for (let i = 0; i < res.rows.length; i++) rows.push(rowToHeightTest(res.rows.item(i)));
    return rows;
  },

  async updateSyncStatus(measurementId: string, status: SyncStatus): Promise<void> {
    const db = getDatabase();
    await db.executeSql(
      'UPDATE height_tests SET syncStatus = ? WHERE measurementId = ?;',
      [status, measurementId],
    );
  },

  async delete(measurementId: string): Promise<void> {
    const db = getDatabase();
    await db.executeSql('DELETE FROM height_tests WHERE measurementId = ?;', [measurementId]);
  },
};
