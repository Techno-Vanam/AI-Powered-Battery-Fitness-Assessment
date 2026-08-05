import { getClient, dbExecute } from './db.js';

/**
 * Connection wrapper providing MySQL/pool-compatible query & transaction interface
 * backed by libSQL/SQLite (or MySQL when connected).
 */

export async function query(sql, params = []) {
  const result = await dbExecute(sql, params);
  
  if (sql.trim().toUpperCase().startsWith('INSERT')) {
    return [{ insertId: Number(result.lastInsertRowid ?? result.insertId ?? 0) }];
  }
  
  if (sql.trim().toUpperCase().startsWith('UPDATE') || sql.trim().toUpperCase().startsWith('DELETE')) {
    return [{ affectedRows: result.rowsAffected ?? 0 }];
  }

  // SELECT or other queries returning rows
  const rows = result.rows ? Array.from(result.rows) : [];
  return [rows];
}

export async function getConnection() {
  const client = getClient();
  let tx = null;

  return {
    async beginTransaction() {
      tx = await client.transaction('write');
    },
    async query(sql, params = []) {
      const exec = tx ? tx.execute.bind(tx) : client.execute.bind(client);
      const result = await exec({ sql, args: params });

      if (sql.trim().toUpperCase().startsWith('INSERT')) {
        return [{ insertId: Number(result.lastInsertRowid ?? result.insertId ?? 0) }];
      }

      if (sql.trim().toUpperCase().startsWith('UPDATE') || sql.trim().toUpperCase().startsWith('DELETE')) {
        return [{ affectedRows: result.rowsAffected ?? 0 }];
      }

      const rows = result.rows ? Array.from(result.rows) : [];
      return [rows];
    },
    async commit() {
      if (tx) {
        await tx.commit();
        tx = null;
      }
    },
    async rollback() {
      if (tx) {
        await tx.rollback();
        tx = null;
      }
    },
    release() {
      tx = null;
    }
  };
}

export default {
  query,
  getConnection
};
