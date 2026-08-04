import { open, type DB } from '@op-engineering/op-sqlite';

const DATABASE_NAME = 'SportsApp.db';

let _db: DB | null = null;

export const getDBConnection = (): DB => {
  if (!_db) {
    _db = open({ name: DATABASE_NAME });
  }
  return _db;
};

export const createTables = (): void => {
  const db = getDBConnection();

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS users (
      local_id TEXT PRIMARY KEY,
      server_id TEXT,
      role TEXT NOT NULL,
      full_name TEXT NOT NULL,
      dob TEXT,
      gender TEXT NOT NULL,
      phone TEXT,
      id_type TEXT NOT NULL,
      id_number TEXT NOT NULL,
      school_or_org TEXT,
      designation TEXT,
      guardian_name TEXT,
      guardian_relation TEXT,
      password_hash TEXT,
      is_verified INTEGER DEFAULT 0,
      consent_given INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT DEFAULT 'pending',
      UNIQUE(id_type, id_number)
    );
  `);

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_local_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      attempts INTEGER DEFAULT 0
    );
  `);

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_local_id TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      verified INTEGER DEFAULT 0
    );
  `);

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

  console.log('[DB] Tables created successfully');
};

