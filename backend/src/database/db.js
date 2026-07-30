import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import env from '../config/env.js';
import { migrations } from './migrations.js';

let _db = null;

/**
 * Returns the singleton database connection.
 * Throws if called before initialise().
 */
export function getDB() {
  if (!_db) {
    throw new Error('Database has not been initialised. Call initialiseDB() first.');
  }
  return _db;
}

/**
 * Opens the SQLite database, enables WAL mode, enforces foreign keys,
 * and runs all DDL migrations.  Safe to call multiple times — idempotent.
 */
export function initialiseDB() {
  if (_db) return _db;

  // Ensure the data directory exists
  const dir = dirname(env.DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  _db = new Database(env.DB_PATH, {
    // verbose: env.IS_DEVELOPMENT ? console.log : undefined,
  });

  // Performance and integrity pragmas
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  _db.pragma('synchronous = NORMAL');
  _db.pragma('temp_store = MEMORY');
  _db.pragma('mmap_size = 268435456'); // 256 MB

  runMigrations(_db);

  console.log(`[DB] Initialised → ${env.DB_PATH}`);
  return _db;
}

/**
 * Executes every migration statement inside a single transaction.
 * Uses CREATE TABLE/INDEX IF NOT EXISTS so re-running is safe.
 */
function runMigrations(db) {
  const run = db.transaction(() => {
    for (const sql of migrations) {
      db.prepare(sql).run();
    }
  });
  run();
  console.log(`[DB] Migrations complete (${migrations.length} statements)`);
}

/**
 * Gracefully closes the database.  Called on process shutdown.
 */
export function closeDB() {
  if (_db) {
    _db.close();
    _db = null;
    console.log('[DB] Connection closed');
  }
}
