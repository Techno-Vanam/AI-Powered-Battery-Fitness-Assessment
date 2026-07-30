import { getDB } from '../database/db.js';

function db() {
  return getDB();
}

/**
 * Enqueue a sync item.
 * @param {object} params
 * @param {string} params.entity_type
 * @param {string} params.entity_local_id
 * @param {string} params.operation        'INSERT' | 'UPDATE'
 * @param {string} params.payload          JSON string
 * @param {string} params.created_at       ISO timestamp
 * @returns {number} queue_id of the inserted row
 */
export function enqueue({ entity_type, entity_local_id, operation, payload, created_at }) {
  const result = db()
    .prepare(
      `INSERT INTO sync_queue
         (entity_type, entity_local_id, operation, payload, created_at, attempts)
       VALUES (?, ?, ?, ?, ?, 0)`
    )
    .run(entity_type, entity_local_id, operation, payload, created_at);
  return result.lastInsertRowid;
}

/**
 * Return all pending sync items ordered oldest-first.
 * @returns {object[]}
 */
export function getAllPending() {
  return db()
    .prepare(
      `SELECT * FROM sync_queue ORDER BY created_at ASC`
    )
    .all();
}

/**
 * Return pending items for a specific entity type.
 * @param {string} entity_type
 * @returns {object[]}
 */
export function getPendingByType(entity_type) {
  return db()
    .prepare(
      `SELECT * FROM sync_queue
       WHERE entity_type = ?
       ORDER BY created_at ASC`
    )
    .all(entity_type);
}

/**
 * Increment the attempt counter for a queued item.
 * @param {number} queue_id
 */
export function incrementAttempts(queue_id) {
  db()
    .prepare(
      `UPDATE sync_queue SET attempts = attempts + 1 WHERE queue_id = ?`
    )
    .run(queue_id);
}

/**
 * Remove a successfully synced item from the queue.
 * @param {number} queue_id
 */
export function dequeue(queue_id) {
  db()
    .prepare(`DELETE FROM sync_queue WHERE queue_id = ?`)
    .run(queue_id);
}

/**
 * Remove all queued items for a specific entity.
 * Used when a conflict is resolved and all queued ops are superseded.
 * @param {string} entity_local_id
 */
export function dequeueByEntityId(entity_local_id) {
  db()
    .prepare(`DELETE FROM sync_queue WHERE entity_local_id = ?`)
    .run(entity_local_id);
}

/**
 * Count how many items are currently queued.
 * @returns {number}
 */
export function countPending() {
  const row = db()
    .prepare(`SELECT COUNT(*) AS cnt FROM sync_queue`)
    .get();
  return row.cnt;
}
