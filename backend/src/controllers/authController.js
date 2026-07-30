import * as authService from '../services/authService.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.js';
import { HTTP, OTP_EXPIRY_MINUTES } from '../config/constants.js';

/** Seconds the OTP is valid — derived from the single source of truth in constants. */
const OTP_EXPIRES_IN_SECONDS = OTP_EXPIRY_MINUTES * 60;

// ── POST /api/auth/register/athlete ──────────────────────────────────────────
export async function registerAthlete(req, res, next) {
  try {
    const { user, otp_code } = await authService.registerUser(req.body);
    return sendCreated(res, 'Athlete registered successfully.', {
      user,
      mock_otp:   otp_code,
      expires_in: OTP_EXPIRES_IN_SECONDS,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/register/coach ─────────────────────────────────────────────
export async function registerCoach(req, res, next) {
  try {
    const { user, otp_code } = await authService.registerUser(req.body);
    return sendCreated(res, 'Coach registered successfully.', {
      user,
      mock_otp:   otp_code,
      expires_in: OTP_EXPIRES_IN_SECONDS,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/otp/verify ─────────────────────────────────────────────────
export async function verifyOtp(req, res, next) {
  try {
    const { local_id, otp_code } = req.body;
    const { user } = await authService.verifyOtp(local_id, otp_code);
    return sendSuccess(res, 'OTP verified successfully.', { user });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/otp/resend ─────────────────────────────────────────────────
export async function resendOtp(req, res, next) {
  try {
    const { local_id } = req.body;
    if (!local_id || typeof local_id !== 'string') {
      return sendError(res, 'local_id is required.', HTTP.BAD_REQUEST);
    }
    const { otp_code } = await authService.resendOtp(local_id);
    return sendSuccess(res, 'A new OTP has been issued.', {
      mock_otp:   otp_code,
      expires_in: OTP_EXPIRES_IN_SECONDS,
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/password/set ───────────────────────────────────────────────
export async function setPassword(req, res, next) {
  try {
    const { local_id, password } = req.body;
    const { user } = await authService.setPassword(local_id, password);
    return sendSuccess(res, 'Password set successfully.', { user });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { id_type, id_number, password, role } = req.body;
    const { user } = await authService.loginUser(id_type, id_number, password, role);
    return sendSuccess(res, 'Login successful.', { user });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/password/forgot ────────────────────────────────────────────
export async function forgotPassword(req, res, next) {
  try {
    const { id_type, id_number, role } = req.body;
    const result = await authService.forgotPassword(id_type, id_number, role);
    return sendSuccess(res, 'Account found. You may now reset your password.', result);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/password/reset ─────────────────────────────────────────────
export async function resetPassword(req, res, next) {
  try {
    const { local_id, password } = req.body;
    const { user } = await authService.resetPassword(local_id, password);
    return sendSuccess(res, 'Password reset successfully.', { user });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/auth/users/:local_id ─────────────────────────────────────────────
export async function getUser(req, res, next) {
  try {
    const { local_id } = req.params;
    if (!local_id || typeof local_id !== 'string') {
      return sendError(res, 'local_id param is required.', HTTP.BAD_REQUEST);
    }
    const { user } = await authService.getUserByLocalId(local_id);
    return sendSuccess(res, 'User retrieved successfully.', { user });
  } catch (err) {
    next(err);
  }
}
