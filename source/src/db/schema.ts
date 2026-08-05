import { open, type DB } from '@op-engineering/op-sqlite';

const DATABASE_NAME = 'SportsApp.db';

let _db: DB | null = null;

export const getDBConnection = (): DB => {
  if (!_db) {
    _db = open({ name: DATABASE_NAME });
  }
  return _db;
};


export const PENDING_SIT_AND_REACH_SCHEMA = `
  CREATE TABLE IF NOT EXISTS pending_sit_and_reach (
    local_id TEXT PRIMARY KEY,          -- client UUID, doubles as idempotency key
    action TEXT NOT NULL DEFAULT 'create',   -- 'create' | 'correct'
    correction_of_id INTEGER,           -- server-side id being corrected, only set when action = 'correct'
    athlete_id INTEGER NOT NULL,
    trial_1 REAL NOT NULL,
    trial_2 REAL NOT NULL,
    trial_3 REAL NOT NULL,
    notes TEXT,
    session_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending'   -- 'pending' | 'syncing' | 'failed'
  );
`;

export const createTables = (): void => {
  const db = getDBConnection();

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS WeightMeasurements (
      id TEXT PRIMARY KEY,
      weight REAL NOT NULL,
      ocrRawText TEXT,
      ocrConfidence REAL NOT NULL,
      capturedImagePath TEXT,
      timestamp TEXT NOT NULL,
      syncStatus TEXT DEFAULT 'Pending',
      retryCount INTEGER DEFAULT 0
    );
  `);

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS dashboard_cache (
      key TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.executeSync(PENDING_SIT_AND_REACH_SCHEMA);

  console.log('[DB] Tables created successfully');
};

