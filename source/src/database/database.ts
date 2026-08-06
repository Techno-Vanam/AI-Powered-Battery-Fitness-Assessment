// @ts-ignore
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

// ─── SQLCipher configuration ──────────────────────────────────────────────────
SQLite.enablePromise(true);

const DB_NAME    = 'sports_fitness.db';

// Encryption key — in production, derive this from device-bound secure storage
// (e.g. Android Keystore). For this phase it is a fixed key.
const DB_KEY = 'sf_enc_key_v1_2025';

// ─── Schema DDL ───────────────────────────────────────────────────────────────
const DDL_ATHLETES = `
  CREATE TABLE IF NOT EXISTS athletes (
    id             TEXT PRIMARY KEY NOT NULL,
    name           TEXT NOT NULL,
    gender         TEXT NOT NULL DEFAULT 'unknown',
    dateOfBirth    TEXT,
    phone          TEXT,
    heightCategory TEXT,
    coachName      TEXT,
    schoolAcademy  TEXT,
    state          TEXT,
    district       TEXT,
    createdAt      INTEGER NOT NULL,
    updatedAt      INTEGER NOT NULL
  );
`;

const DDL_HEIGHT_TESTS = `
  CREATE TABLE IF NOT EXISTS height_tests (
    measurementId      TEXT PRIMARY KEY NOT NULL,
    athleteId          TEXT NOT NULL,
    teamId             TEXT,
    sessionId          TEXT,
    heightCm           REAL NOT NULL,
    confidence         REAL NOT NULL,
    deviceModel        TEXT NOT NULL,
    timestamp          INTEGER NOT NULL,
    calibrationMethod  TEXT NOT NULL,
    stableFrameCount   INTEGER NOT NULL DEFAULT 0,
    videoDurationSec   REAL NOT NULL DEFAULT 0,
    pixelsPerCm        REAL NOT NULL DEFAULT 0,
    syncStatus         TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (athleteId) REFERENCES athletes(id)
  );
`;

const DDL_SYNC_QUEUE = `
  CREATE TABLE IF NOT EXISTS sync_queue (
    id          TEXT PRIMARY KEY NOT NULL,
    tableName   TEXT NOT NULL,
    recordId    TEXT NOT NULL,
    operation   TEXT NOT NULL DEFAULT 'INSERT',
    retryCount  INTEGER NOT NULL DEFAULT 0,
    lastAttempt INTEGER,
    createdAt   INTEGER NOT NULL
  );
`;

const DDL_VIDEOS = `
  CREATE TABLE IF NOT EXISTS videos (
    id            TEXT PRIMARY KEY NOT NULL,
    athleteId     TEXT NOT NULL,
    localPath     TEXT NOT NULL,
    thumbnailPath TEXT,
    duration      INTEGER NOT NULL DEFAULT 0,
    fileSize      INTEGER NOT NULL DEFAULT 0,
    createdAt     INTEGER NOT NULL,
    syncStatus    TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (athleteId) REFERENCES athletes(id)
  );
`;

const DDL_INDICES = [
  `CREATE INDEX IF NOT EXISTS idx_height_tests_athlete ON height_tests(athleteId);`,
  `CREATE INDEX IF NOT EXISTS idx_height_tests_sync    ON height_tests(syncStatus);`,
  `CREATE INDEX IF NOT EXISTS idx_sync_queue_table     ON sync_queue(tableName);`,
  `CREATE INDEX IF NOT EXISTS idx_sync_queue_retry     ON sync_queue(retryCount);`,
  `CREATE INDEX IF NOT EXISTS idx_videos_athlete       ON videos(athleteId);`,
];

// ─── Database singleton ───────────────────────────────────────────────────────
let _db: SQLiteDatabase | null = null;
let _opening: Promise<SQLiteDatabase> | null = null;

export async function openDatabase(): Promise<SQLiteDatabase> {
  if (_db) return _db;
  if (_opening) return _opening;

  _opening = (async () => {
    const dbInstance: SQLiteDatabase = await SQLite.openDatabase({
      name: DB_NAME,
      key: DB_KEY,
      location: 'default',
    });

    try {
      await dbInstance.executeSql('PRAGMA journal_mode = WAL;');
      await dbInstance.executeSql('PRAGMA synchronous = NORMAL;');
      await dbInstance.executeSql('PRAGMA cache_size = -2000;');
      await dbInstance.executeSql('PRAGMA temp_store = MEMORY;');
    } catch {
      // Ignore if PRAGMA is restricted
    }

    await runMigrations(dbInstance);
    _db = dbInstance;
    return _db;
  })();

  try {
    return await _opening;
  } finally {
    _opening = null;
  }
}

export async function closeDatabase(): Promise<void> {
  if (_db) {
    await _db.close();
    _db = null;
  }
  _opening = null;
}

export function getDatabase(): SQLiteDatabase {
  if (!_db) throw new Error('Database not initialised. Call openDatabase() first.');
  return _db;
}

// ─── Migration helpers ────────────────────────────────────────────────────────
async function getTableColumns(db: SQLiteDatabase, table: string): Promise<Set<string>> {
  const [result] = await db.executeSql(`PRAGMA table_info(${table});`);
  const columns = new Set<string>();
  if (result?.rows) {
    for (let i = 0; i < result.rows.length; i++) {
      columns.add(result.rows.item(i).name);
    }
  }
  return columns;
}

async function ensureColumn(
  db: SQLiteDatabase,
  table: string,
  column: string,
  definition: string,
): Promise<void> {
  const columns = await getTableColumns(db, table);
  if (!columns.has(column)) {
    await db.executeSql(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

async function markMigrationApplied(db: SQLiteDatabase, version: number): Promise<void> {
  await db.executeSql(
    'INSERT INTO schema_version (version, appliedAt) VALUES (?, ?);',
    [version, Date.now()],
  );
}

// ─── Migration runner ─────────────────────────────────────────────────────────
async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Create schema_version table to track applied migrations
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY NOT NULL,
      appliedAt INTEGER NOT NULL
    );
  `);

  const [result] = await db.executeSql(
    'SELECT MAX(version) as v FROM schema_version;',
  );
  const row = result && result.rows && result.rows.length > 0 ? result.rows.item(0) : null;
  const currentVersion: number = row?.v ?? 0;

  if (currentVersion < 1) {
    await applyMigrationV1(db);
  }
  if (currentVersion < 2) {
    await applyMigrationV2(db);
  }
  if (currentVersion < 3) {
    await applyMigrationV3(db);
  }
}

async function applyMigrationV1(db: SQLiteDatabase): Promise<void> {
  await db.transaction((tx: any) => {
    tx.executeSql(DDL_ATHLETES);
    tx.executeSql(DDL_HEIGHT_TESTS);
    tx.executeSql(DDL_SYNC_QUEUE);
    tx.executeSql(DDL_VIDEOS);
    DDL_INDICES.forEach(idx => tx.executeSql(idx));
    tx.executeSql(
      'INSERT INTO schema_version (version, appliedAt) VALUES (1, ?);',
      [Date.now()],
    );
  });
}

async function applyMigrationV2(db: SQLiteDatabase): Promise<void> {
  const athleteColumns: Array<[string, string]> = [
    ['heightCategory', 'TEXT'],
    ['coachName', 'TEXT'],
    ['schoolAcademy', 'TEXT'],
    ['state', 'TEXT'],
    ['district', 'TEXT'],
  ];

  for (const [column, definition] of athleteColumns) {
    await ensureColumn(db, 'athletes', column, definition);
  }

  await markMigrationApplied(db, 2);
}

async function applyMigrationV3(db: SQLiteDatabase): Promise<void> {
  await db.transaction((tx: any) => {
    tx.executeSql('DROP TABLE IF EXISTS height_tests;');
    tx.executeSql(DDL_HEIGHT_TESTS);
    tx.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_height_tests_athlete ON height_tests(athleteId);',
    );
    tx.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_height_tests_sync ON height_tests(syncStatus);',
    );
    tx.executeSql(
      'INSERT INTO schema_version (version, appliedAt) VALUES (3, ?);',
      [Date.now()],
    );
  });
}
