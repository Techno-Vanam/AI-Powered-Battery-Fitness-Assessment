import { getDBConnection } from './schema';

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  updated_at: string;
}

export const getCachedData = <T = any>(key: string): { data: T; updated_at: string } | null => {
  try {
    const db = getDBConnection();
    const result = db.executeSync(
      'SELECT payload, updated_at FROM dashboard_cache WHERE key = ? LIMIT 1',
      [key]
    );

    if (result.rows && result.rows.length > 0) {
      const row = result.rows.item(0);
      const data = JSON.parse(row.payload as string) as T;
      return { data, updated_at: row.updated_at as string };
    }
  } catch (err) {
    console.warn('[CacheRepo] Failed to read from cache:', err);
  }
  return null;
};

export const setCachedData = <T = any>(key: string, data: T): void => {
  try {
    const db = getDBConnection();
    const payload = JSON.stringify(data);
    const now = new Date().toISOString();

    db.executeSync(
      `INSERT INTO dashboard_cache (key, payload, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at`,
      [key, payload, now]
    );
  } catch (err) {
    console.warn('[CacheRepo] Failed to write to cache:', err);
  }
};
