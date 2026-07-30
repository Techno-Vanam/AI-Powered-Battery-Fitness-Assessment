import * as userRepo from '../repositories/userRepository.js';
import * as otpRepo from '../repositories/otpRepository.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateOtp, otpExpiresAt } from '../utils/otp.js';
import { nowISO } from '../utils/date.js';
import { SYNC_STATUS } from '../config/constants.js';
import { withTransaction } from '../database/db.js';

function sanitiseUser(user) {
  if (!user) return user;
  const { password_hash, ...safe } = user;
  return safe;
}

export async function registerUser(payload) {
  const existingByLocalId = await userRepo.findByLocalId(payload.local_id);
  if (existingByLocalId) {
    const otp_code = await _issueOtp(existingByLocalId.local_id);
    return { user: sanitiseUser(existingByLocalId), otp_code };
  }

  if (await userRepo.identifierExists(payload.id_type, payload.id_number)) {
    const err = new Error('An account with this ID already exists.');
    err.statusCode = 409;
    throw err;
  }

  const now = nowISO();
  const userRecord = {
    local_id: payload.local_id,
    server_id: null,
    role: payload.role,
    full_name: payload.full_name,
    dob: payload.dob ?? null,
    gender: payload.gender,
    phone: payload.phone ?? null,
    id_type: payload.id_type,
    id_number: payload.id_number,
    school_or_org: payload.school_or_org ?? null,
    designation: payload.designation ?? null,
    guardian_name: payload.guardian_name ?? null,
    guardian_relation: payload.guardian_relation ?? null,
    password_hash: null,
    is_verified: 0,
    consent_given: payload.consent_given,
    created_at: now,
    updated_at: now,
    sync_status: SYNC_STATUS.PENDING,
  };

  await userRepo.insertUser(userRecord);
  const otp_code = await _issueOtp(payload.local_id);
  const created = await userRepo.findByLocalId(payload.local_id);
  return { user: sanitiseUser(created), otp_code };
}

async function _issueOtp(user_local_id) {
  const code = generateOtp();
  const now = nowISO();
  const expires_at = otpExpiresAt();

  await withTransaction(async (tx) => {
    await tx.run(
      `UPDATE otp_verifications SET verified = 1 WHERE user_local_id = ? AND verified = 0`,
      [user_local_id]
    );
    await tx.run(
      `INSERT INTO otp_verifications (user_local_id, otp_code, expires_at, verified, created_at)
       VALUES (?, ?, ?, 0, ?)`,
      [user_local_id, code, expires_at, now]
    );
  });

  return code;
}

export async function resendOtp(local_id) {
  const user = await userRepo.findByLocalId(local_id);
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

export async function verifyOtp(local_id, otp_code) {
  const user = await userRepo.findByLocalId(local_id);
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
  const otpRecord = await otpRepo.findValidOtp(local_id, now);

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

  await withTransaction(async (tx) => {
    await tx.run(`UPDATE otp_verifications SET verified = 1 WHERE id = ?`, [otpRecord.id]);
    await tx.run(`UPDATE users SET is_verified = 1, updated_at = ? WHERE local_id = ?`, [
      nowISO(),
      local_id,
    ]);
  });

  return { user: sanitiseUser(await userRepo.findByLocalId(local_id)) };
}

export async function setPassword(local_id, password) {
  const user = await userRepo.findByLocalId(local_id);
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
  await userRepo.updatePassword(local_id, hash, nowISO());

  return { user: sanitiseUser(await userRepo.findByLocalId(local_id)) };
}

export async function loginUser(id_type, id_number, password, role) {
  const user = await userRepo.findByIdentifier(id_type, id_number, role);

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

export async function forgotPassword(id_type, id_number, role) {
  const user = await userRepo.findByIdentifier(id_type, id_number, role);
  if (!user) {
    const err = new Error('No account found with this ID.');
    err.statusCode = 404;
    throw err;
  }
  return { local_id: user.local_id, full_name: user.full_name };
}

export async function resetPassword(local_id, password) {
  const user = await userRepo.findByLocalId(local_id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const hash = await hashPassword(password);
  await userRepo.updatePassword(local_id, hash, nowISO());

  return { user: sanitiseUser(await userRepo.findByLocalId(local_id)) };
}

export async function getUserByLocalId(local_id) {
  const user = await userRepo.findByLocalId(local_id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return { user: sanitiseUser(user) };
}
