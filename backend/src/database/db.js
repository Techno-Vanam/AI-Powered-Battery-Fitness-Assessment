import { createClient } from '@libsql/client';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import env from '../config/env.js';
import { migrations } from './migrations.js';

/** @type {import('@libsql/client').Client | null} */
let _client = null;

export function getClient() {
  if (!_client) {
    throw new Error('Database has not been initialised. Call initialiseDB() first.');
  }
  return _client;
}

/** @deprecated Use getClient() — kept for gradual migration */
export function getDB() {
  return getClient();
}

export async function initialiseDB() {
  if (_client) return _client;

  if (env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN) {
    _client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
    console.log('[DB] Connected to Turso (libSQL cloud)');
  } else {
    const dir = dirname(env.DB_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    _client = createClient({ url: `file:${env.DB_PATH}` });
    console.log(`[DB] Using local SQLite file → ${env.DB_PATH}`);
  }

  for (const sql of migrations) {
    await _client.execute(sql);
  }

  console.log(`[DB] Migrations complete (${migrations.length} statements)`);
  return _client;
}

export async function dbExecute(sql, args = []) {
  return getClient().execute({ sql, args });
}

export async function dbGet(sql, args = []) {
  const result = await dbExecute(sql, args);
  return result.rows[0] ?? undefined;
}

export async function dbRun(sql, args = []) {
  const result = await dbExecute(sql, args);
  return { changes: result.rowsAffected ?? 0 };
}

export async function withTransaction(fn) {
  const tx = await getClient().transaction('write');
  try {
    await fn({
      execute: (sql, args = []) => tx.execute({ sql, args }),
      get: async (sql, args = []) => {
        const result = await tx.execute({ sql, args });
        return result.rows[0] ?? undefined;
      },
      run: async (sql, args = []) => {
        const result = await tx.execute({ sql, args });
        return { changes: result.rowsAffected ?? 0 };
      },
    });
    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

export function closeDB() {
  if (_client) {
    _client.close();
    _client = null;
    console.log('[DB] Connection closed');
  }
}
