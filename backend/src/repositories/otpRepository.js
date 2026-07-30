import { getDB } from '../database/db.js';

function db() {
  return getDB();
}

/**
 * Insert a new OTP record.
 * @param {object} params
 * @param {string} params.user_local_id
 * @param {string} params.otp_code
 * @param {string} params.expires_at   ISO timestamp
 * @param {string} params.created_at   ISO timestamp
 */
export function insertOtp({ user_local_id, otp_code, expires_at, created_at }) {
  db()
    .prepare(
      `INSERT INTO otp_verifications
         (user_local_id, otp_code, expires_at, verified, created_at)
       VALUES (?, ?, ?, 0, ?)`
    )
    .run(user_local_id, otp_code, expires_at, created_at);
}

/**
 * Return the single most-recent OTP row for a user, regardless of state.
 * @param {string} user_local_id
 * @returns {object|undefined}
 */
export function findLatestOtp(user_local_id) {
  return db()
    .prepare(
      `SELECT * FROM otp_verifications
       WHERE user_local_id = ?
       ORDER BY id DESC
       LIMIT 1`
    )
    .get(user_local_id);
}

/**
 * Return the most-recent OTP row only if it is still valid:
 *   • not expired (expires_at > now)
 *   • not already verified
 * @param {string} user_local_id
 * @param {string} now  ISO timestamp for comparison
 * @returns {object|undefined}
 */
export function findValidOtp(user_local_id, now) {
  return db()
    .prepare(
      `SELECT * FROM otp_verifications
       WHERE user_local_id = ?
         AND expires_at    > ?
         AND verified      = 0
       ORDER BY id DESC
       LIMIT 1`
    )
    .get(user_local_id, now);
}

/**
 * Mark a specific OTP row as verified.
 * @param {number} id  primary key
 */
export function markOtpVerified(id) {
  db()
    .prepare(`UPDATE otp_verifications SET verified = 1 WHERE id = ?`)
    .run(id);
}

/**
 * Invalidate (mark verified = 1) all previous OTPs for a user
 * except the one just inserted.  Keeps the table clean and ensures
 * only the latest OTP is usable.
 * @param {string} user_local_id
 * @param {number} keepId   id of the OTP that should remain active
 */
export function invalidatePreviousOtps(user_local_id, keepId) {
  db()
    .prepare(
      `UPDATE otp_verifications
       SET verified = 1
       WHERE user_local_id = ? AND id != ?`
    )
    .run(user_local_id, keepId);
}

/**
 * Delete all OTP rows older than a given timestamp (house-keeping).
 * @param {string} before  ISO timestamp
 * @returns {number} number of rows deleted
 */
export function deleteExpiredOtps(before) {
  const result = db()
    .prepare(`DELETE FROM otp_verifications WHERE expires_at < ?`)
    .run(before);
  return result.changes;
}
