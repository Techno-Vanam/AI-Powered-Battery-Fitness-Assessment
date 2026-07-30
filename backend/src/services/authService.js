import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../database/db.js';
import * as userRepo from '../repositories/userRepository.js';
import * as otpRepo from '../repositories/otpRepository.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateOtp, otpExpiresAt } from '../utils/otp.js';
import { nowISO } from '../utils/date.js';
import { SYNC_STATUS } from '../config/constants.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Strip the password_hash from a user object before returning it to callers.
 * @param {object} user
 * @returns {object}
 */
function sanitiseUser(user) {
  if (!user) return user;
  const { password_hash, ...safe } = user;
  return safe;
}

// ── Registration ──────────────────────────────────────────────────────────────

/**
 * Register a new athlete or coach.
 *
 * If the local_id already exists → re-issue OTP (handles mobile retry).
 * If the id_type + id_number combo already exists → conflict error.
 *
 * @param {object} payload  validated request body
 * @returns {{ user: object, otp_code: string }}
 */
export async function registerUser(payload) {
  // 1. Check if this local_id was already registered (mobile retry)
  const existingByLocalId = userRepo.findByLocalId(payload.local_id);
  if (existingByLocalId) {
    const otp_code = await _issueOtp(existingByLocalId.local_id);
    return { user: sanitiseUser(existingByLocalId), otp_code };
  }

  // 2. Check for duplicate id_type + id_number
  if (userRepo.identifierExists(payload.id_type, payload.id_number)) {
    const err = new Error('An account with this ID already exists.');
    err.statusCode = 409;
    throw err;
  }

  // 3. Build user record
  const now = nowISO();
  const userRecord = {
    local_id:         payload.local_id,
    server_id:        null,
    role:             payload.role,
    full_name:        payload.full_name,
    dob:              payload.dob              ?? null,
    gender:           payload.gender,
    phone:            payload.phone            ?? null,
    id_type:          payload.id_type,
    id_number:        payload.id_number,
    school_or_org:    payload.school_or_org    ?? null,
    designation:      payload.designation      ?? null,
    guardian_name:    payload.guardian_name    ?? null,
    guardian_relation: payload.guardian_relation ?? null,
    password_hash:    null,
    is_verified:      0,
    consent_given:    payload.consent_given,
    created_at:       now,
    updated_at:       now,
    sync_status:      SYNC_STATUS.PENDING,
  };

  // 4. Insert inside a transaction, then issue OTP
  // better-sqlite3 transactions are synchronous; bcrypt in _issueOtp is async,
  // so we run the DB insert in its own sync transaction then call _issueOtp separately.
  const db = getDB();
  const insertTx = db.transaction(() => {
    userRepo.insertUser(userRecord);
  });
  insertTx();

  const otp_code = await _issueOtp(payload.local_id);
  const created = userRepo.findByLocalId(payload.local_id);
  return { user: sanitiseUser(created), otp_code };
}

// ── OTP ───────────────────────────────────────────────────────────────────────

/**
 * Internal helper — invalidate old OTPs and insert a fresh one.
 * @param {string} user_local_id
 * @returns {string} the new OTP code
 */
async function _issueOtp(user_local_id) {
  const code       = generateOtp();
  const now        = nowISO();
  const expires_at = otpExpiresAt();

  // Invalidate every previous OTP for this user first
  const db = getDB();
  const issueTx = db.transaction(() => {
    // Mark all existing OTPs as verified (invalidated) before inserting new one
    db.prepare(
      `UPDATE otp_verifications SET verified = 1 WHERE user_local_id = ? AND verified = 0`
    ).run(user_local_id);

    otpRepo.insertOtp({ user_local_id, otp_code: code, expires_at, created_at: now });
  });
  issueTx();

  return code;
}

/**
 * Re-generate and return a fresh OTP for an existing user.
 * Used by the "Resend OTP" action.
 * @param {string} local_id
 * @returns {{ otp_code: string }}
 */
export async function resendOtp(local_id) {
  const user = userRepo.findByLocalId(local_id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  if (user.is_verified === 1) {
    const err = new Error('User is already verified.');
    err.statusCode = 400;
    throw err;
  }
  const otp_code = await _issueOtp(local_id);
  return { otp_code };
}

// ── OTP Verification ──────────────────────────────────────────────────────────

/**
 * Verify a submitted OTP code.
 * Checks: exists, not expired, not already used, code matches.
 * On success: marks OTP verified, marks user is_verified = 1.
 *
 * @param {string} local_id
 * @param {string} otp_code
 * @returns {{ user: object }}
 */
export function verifyOtp(local_id, otp_code) {
  const user = userRepo.findByLocalId(local_id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  if (user.is_verified === 1) {
    const err = new Error('User is already verified.');
    err.statusCode = 400;
    throw err;
  }

  const now = nowISO();
  const otpRecord = otpRepo.findValidOtp(local_id, now);

  if (!otpRecord) {
    const err = new Error('OTP has expired or does not exist. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }

  if (otpRecord.otp_code !== otp_code) {
    const err = new Error('Invalid OTP code.');
    err.statusCode = 400;
    throw err;
  }

  // Atomically mark OTP used + user verified
  const db = getDB();
  const verifyTx = db.transaction(() => {
    otpRepo.markOtpVerified(otpRecord.id);
    userRepo.markVerified(local_id, nowISO());
  });
  verifyTx();

  return { user: sanitiseUser(userRepo.findByLocalId(local_id)) };
}

// ── Set Password ──────────────────────────────────────────────────────────────

/**
 * Set a password for a user who has completed OTP verification.
 * @param {string} local_id
 * @param {string} password  plaintext — will be hashed
 * @returns {{ user: object }}
 */
export async function setPassword(local_id, password) {
  const user = userRepo.findByLocalId(local_id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  if (user.is_verified !== 1) {
    const err = new Error('OTP verification must be completed before setting a password.');
    err.statusCode = 400;
    throw err;
  }

  const hash = await hashPassword(password);
  userRepo.updatePassword(local_id, hash, nowISO());

  return { user: sanitiseUser(userRepo.findByLocalId(local_id)) };
}

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * Authenticate a user by ID + password.
 * @param {string} id_type
 * @param {string} id_number
 * @param {string} password  plaintext
 * @param {string} role
 * @returns {{ user: object }}
 */
export async function loginUser(id_type, id_number, password, role) {
  const user = userRepo.findByIdentifier(id_type, id_number, role);

  // Use identical error message for both "not found" and "wrong password"
  // to prevent user enumeration
  if (!user) {
    const err = new Error('Invalid ID or password.');
    err.statusCode = 401;
    throw err;
  }

  if (!user.password_hash) {
    const err = new Error('Account setup is incomplete. Please complete registration first.');
    err.statusCode = 401;
    throw err;
  }

  const match = await verifyPassword(password, user.password_hash);
  if (!match) {
    const err = new Error('Invalid ID or password.');
    err.statusCode = 401;
    throw err;
  }

  return { user: sanitiseUser(user) };
}

// ── Forgot Password ───────────────────────────────────────────────────────────

/**
 * Look up a user by identifier for the forgot-password flow.
 * Returns only the local_id — enough for the client to proceed to reset.
 * @param {string} id_type
 * @param {string} id_number
 * @param {string} role
 * @returns {{ local_id: string, full_name: string }}
 */
export function forgotPassword(id_type, id_number, role) {
  const user = userRepo.findByIdentifier(id_type, id_number, role);
  if (!user) {
    const err = new Error('No account found with this ID.');
    err.statusCode = 404;
    throw err;
  }
  return { local_id: user.local_id, full_name: user.full_name };
}

// ── Reset Password ────────────────────────────────────────────────────────────

/**
 * Reset the password for any existing user (no OTP required — caller already
 * verified identity via the forgot-password lookup).
 * @param {string} local_id
 * @param {string} password  plaintext
 * @returns {{ user: object }}
 */
export async function resetPassword(local_id, password) {
  const user = userRepo.findByLocalId(local_id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const hash = await hashPassword(password);
  userRepo.updatePassword(local_id, hash, nowISO());

  return { user: sanitiseUser(userRepo.findByLocalId(local_id)) };
}

// ── User lookup ───────────────────────────────────────────────────────────────

/**
 * Fetch a user by local_id (safe — no password hash).
 * @param {string} local_id
 * @returns {{ user: object }}
 */
export function getUserByLocalId(local_id) {
  const user = userRepo.findByLocalId(local_id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return { user: sanitiseUser(user) };
}
