import { dbGet, dbRun, withTransaction } from '../database/db.js';

export async function insertUser(user) {
  await dbRun(
    `INSERT INTO users (
      local_id, server_id, role, full_name, dob, gender, phone,
      id_type, id_number, school_or_org, designation,
      guardian_name, guardian_relation,
      password_hash, is_verified, consent_given,
      created_at, updated_at, sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.local_id, user.server_id, user.role, user.full_name, user.dob, user.gender,
      user.phone, user.id_type, user.id_number, user.school_or_org, user.designation,
      user.guardian_name, user.guardian_relation, user.password_hash, user.is_verified,
      user.consent_given, user.created_at, user.updated_at, user.sync_status,
    ]
  );
  return findByLocalId(user.local_id);
}

export async function findByLocalId(local_id) {
  return dbGet(`SELECT * FROM users WHERE local_id = ?`, [local_id]);
}

export async function findByIdentifier(id_type, id_number, role = null) {
  if (role) {
    return dbGet(
      `SELECT * FROM users WHERE id_type = ? AND id_number = ? AND role = ? LIMIT 1`,
      [id_type, id_number, role]
    );
  }
  return dbGet(
    `SELECT * FROM users WHERE id_type = ? AND id_number = ? LIMIT 1`,
    [id_type, id_number]
  );
}

export async function markVerified(local_id, updated_at) {
  await dbRun(
    `UPDATE users SET is_verified = 1, updated_at = ? WHERE local_id = ?`,
    [updated_at, local_id]
  );
}

export async function updatePassword(local_id, password_hash, updated_at) {
  await dbRun(
    `UPDATE users SET password_hash = ?, updated_at = ?, sync_status = 'pending' WHERE local_id = ?`,
    [password_hash, updated_at, local_id]
  );
}

export async function markSynced(local_id, server_id, updated_at) {
  await dbRun(
    `UPDATE users SET server_id = ?, sync_status = 'synced', updated_at = ? WHERE local_id = ?`,
    [server_id, updated_at, local_id]
  );
}

export async function markConflict(local_id, updated_at) {
  await dbRun(
    `UPDATE users SET sync_status = 'conflict', updated_at = ? WHERE local_id = ?`,
    [updated_at, local_id]
  );
}

export async function upsertUser(user) {
  await dbRun(
    `INSERT INTO users (
      local_id, server_id, role, full_name, dob, gender, phone,
      id_type, id_number, school_or_org, designation,
      guardian_name, guardian_relation,
      password_hash, is_verified, consent_given,
      created_at, updated_at, sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (local_id) DO UPDATE SET
      server_id = excluded.server_id,
      full_name = excluded.full_name,
      dob = excluded.dob,
      gender = excluded.gender,
      phone = excluded.phone,
      school_or_org = excluded.school_or_org,
      designation = excluded.designation,
      guardian_name = excluded.guardian_name,
      guardian_relation = excluded.guardian_relation,
      password_hash = excluded.password_hash,
      is_verified = excluded.is_verified,
      consent_given = excluded.consent_given,
      updated_at = excluded.updated_at,
      sync_status = excluded.sync_status`,
    [
      user.local_id, user.server_id, user.role, user.full_name, user.dob, user.gender,
      user.phone, user.id_type, user.id_number, user.school_or_org, user.designation,
      user.guardian_name, user.guardian_relation, user.password_hash, user.is_verified,
      user.consent_given, user.created_at, user.updated_at, user.sync_status,
    ]
  );
}

export async function identifierExists(id_type, id_number, excludeLocalId = null) {
  if (excludeLocalId) {
    const row = await dbGet(
      `SELECT 1 AS ok FROM users WHERE id_type = ? AND id_number = ? AND local_id != ? LIMIT 1`,
      [id_type, id_number, excludeLocalId]
    );
    return !!row;
  }
  const row = await dbGet(
    `SELECT 1 AS ok FROM users WHERE id_type = ? AND id_number = ? LIMIT 1`,
    [id_type, id_number]
  );
  return !!row;
}
