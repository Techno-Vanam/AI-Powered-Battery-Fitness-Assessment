import { dbGet, dbRun } from '../database/db.js';

export async function insertOtp({ user_local_id, otp_code, expires_at, created_at }) {
  await dbRun(
    `INSERT INTO otp_verifications (user_local_id, otp_code, expires_at, verified, created_at)
     VALUES (?, ?, ?, 0, ?)`,
    [user_local_id, otp_code, expires_at, created_at]
  );
}

export async function findLatestOtp(user_local_id) {
  return dbGet(
    `SELECT * FROM otp_verifications WHERE user_local_id = ? ORDER BY id DESC LIMIT 1`,
    [user_local_id]
  );
}

export async function findValidOtp(user_local_id, now) {
  return dbGet(
    `SELECT * FROM otp_verifications
     WHERE user_local_id = ? AND expires_at > ? AND verified = 0
     ORDER BY id DESC LIMIT 1`,
    [user_local_id, now]
  );
}

export async function markOtpVerified(id) {
  await dbRun(`UPDATE otp_verifications SET verified = 1 WHERE id = ?`, [id]);
}

export async function invalidatePreviousOtps(user_local_id, keepId) {
  await dbRun(
    `UPDATE otp_verifications SET verified = 1 WHERE user_local_id = ? AND id != ?`,
    [user_local_id, keepId]
  );
}

export async function deleteExpiredOtps(before) {
  const result = await dbRun(
    `DELETE FROM otp_verifications WHERE expires_at < ?`,
    [before]
  );
  return result.changes;
}
