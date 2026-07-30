import { getDB } from '../database/db.js';

// ── Queries (prepared lazily per connection) ──────────────────────────────────

function db() {
  return getDB();
}

/**
 * Insert a new user row.
 * @param {object} user
 * @returns {object} the created row
 */
export function insertUser(user) {
  const stmt = db().prepare(`
    INSERT INTO users (
      local_id, server_id, role, full_name, dob, gender, phone,
      id_type, id_number, school_or_org, designation,
      guardian_name, guardian_relation,
      password_hash, is_verified, consent_given,
      created_at, updated_at, sync_status
    ) VALUES (
      @local_id, @server_id, @role, @full_name, @dob, @gender, @phone,
      @id_type, @id_number, @school_or_org, @designation,
      @guardian_name, @guardian_relation,
      @password_hash, @is_verified, @consent_given,
      @created_at, @updated_at, @sync_status
    )
  `);
  stmt.run(user);
  return findByLocalId(user.local_id);
}

/**
 * Find a user by their primary key.
 * @param {string} local_id
 * @returns {object|undefined}
 */
export function findByLocalId(local_id) {
  return db()
    .prepare(`SELECT * FROM users WHERE local_id = ?`)
    .get(local_id);
}

/**
 * Find a user by id_type + id_number (+ optional role).
 * @param {string} id_type
 * @param {string} id_number
 * @param {string|null} role
 * @returns {object|undefined}
 */
export function findByIdentifier(id_type, id_number, role = null) {
  if (role) {
    return db()
      .prepare(
        `SELECT * FROM users
         WHERE id_type = ? AND id_number = ? AND role = ?
         LIMIT 1`
      )
      .get(id_type, id_number, role);
  }
  return db()
    .prepare(
      `SELECT * FROM users
       WHERE id_type = ? AND id_number = ?
       LIMIT 1`
    )
    .get(id_type, id_number);
}

/**
 * Mark a user as OTP-verified.
 * @param {string} local_id
 * @param {string} updated_at  ISO timestamp
 */
export function markVerified(local_id, updated_at) {
  db()
    .prepare(
      `UPDATE users SET is_verified = 1, updated_at = ? WHERE local_id = ?`
    )
    .run(updated_at, local_id);
}

/**
 * Save a bcrypt password hash for the user.
 * @param {string} local_id
 * @param {string} password_hash
 * @param {string} updated_at  ISO timestamp
 */
export function updatePassword(local_id, password_hash, updated_at) {
  db()
    .prepare(
      `UPDATE users
       SET password_hash = ?, updated_at = ?, sync_status = 'pending'
       WHERE local_id = ?`
    )
    .run(password_hash, updated_at, local_id);
}

/**
 * Mark a user as synced and attach the server-assigned ID.
 * @param {string} local_id
 * @param {string} server_id
 * @param {string} updated_at
 */
export function markSynced(local_id, server_id, updated_at) {
  db()
    .prepare(
      `UPDATE users
       SET server_id = ?, sync_status = 'synced', updated_at = ?
       WHERE local_id = ?`
    )
    .run(server_id, updated_at, local_id);
}

/**
 * Mark a user record as conflicted.
 * @param {string} local_id
 * @param {string} updated_at
 */
export function markConflict(local_id, updated_at) {
  db()
    .prepare(
      `UPDATE users
       SET sync_status = 'conflict', updated_at = ?
       WHERE local_id = ?`
    )
    .run(updated_at, local_id);
}

/**
 * Upsert a user record that arrives via the sync endpoint.
 * If local_id already exists — update all mutable fields.
 * If it does not — insert fresh.
 *
 * Uses a single INSERT OR REPLACE wrapped in a transaction so callers
 * can batch multiple calls inside their own outer transaction.
 *
 * @param {object} user
 */
export function upsertUser(user) {
  db()
    .prepare(
      `INSERT INTO users (
        local_id, server_id, role, full_name, dob, gender, phone,
        id_type, id_number, school_or_org, designation,
        guardian_name, guardian_relation,
        password_hash, is_verified, consent_given,
        created_at, updated_at, sync_status
      ) VALUES (
        @local_id, @server_id, @role, @full_name, @dob, @gender, @phone,
        @id_type, @id_number, @school_or_org, @designation,
        @guardian_name, @guardian_relation,
        @password_hash, @is_verified, @consent_given,
        @created_at, @updated_at, @sync_status
      )
      ON CONFLICT (local_id) DO UPDATE SET
        server_id         = excluded.server_id,
        full_name         = excluded.full_name,
        dob               = excluded.dob,
        gender            = excluded.gender,
        phone             = excluded.phone,
        school_or_org     = excluded.school_or_org,
        designation       = excluded.designation,
        guardian_name     = excluded.guardian_name,
        guardian_relation = excluded.guardian_relation,
        password_hash     = excluded.password_hash,
        is_verified       = excluded.is_verified,
        consent_given     = excluded.consent_given,
        updated_at        = excluded.updated_at,
        sync_status       = excluded.sync_status`
    )
    .run(user);
}

/**
 * Check whether a given id_type + id_number pair already exists
 * (optionally excluding a specific local_id — useful during updates).
 * @param {string} id_type
 * @param {string} id_number
 * @param {string|null} excludeLocalId
 * @returns {boolean}
 */
export function identifierExists(id_type, id_number, excludeLocalId = null) {
  if (excludeLocalId) {
    const row = db()
      .prepare(
        `SELECT 1 FROM users
         WHERE id_type = ? AND id_number = ? AND local_id != ?
         LIMIT 1`
      )
      .get(id_type, id_number, excludeLocalId);
    return !!row;
  }
  const row = db()
    .prepare(
      `SELECT 1 FROM users WHERE id_type = ? AND id_number = ? LIMIT 1`
    )
    .get(id_type, id_number);
  return !!row;
}
