import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import {
  registerAthleteSchema,
  registerCoachSchema,
  verifyOtpSchema,
  setPasswordSchema,
  resetPasswordSchema,
  loginSchema,
  forgotPasswordSchema,
} from '../schemas/authSchemas.js';
import {
  registerAthlete,
  registerCoach,
  verifyOtp,
  resendOtp,
  setPassword,
  login,
  forgotPassword,
  resetPassword,
  getUser,
} from '../controllers/authController.js';

const router = Router();

// ── Registration ──────────────────────────────────────────────────────────────
// POST /api/auth/register/athlete
router.post('/register/athlete', validate(registerAthleteSchema), registerAthlete);

// POST /api/auth/register/coach
router.post('/register/coach', validate(registerCoachSchema), registerCoach);

// ── OTP ───────────────────────────────────────────────────────────────────────
// POST /api/auth/otp/verify
router.post('/otp/verify', validate(verifyOtpSchema), verifyOtp);

// POST /api/auth/otp/resend  — body: { local_id }
// Lightweight body; no dedicated schema needed beyond the controller guard
router.post('/otp/resend', resendOtp);

// ── Password management ───────────────────────────────────────────────────────
// POST /api/auth/password/set
router.post('/password/set', validate(setPasswordSchema), setPassword);

// POST /api/auth/password/forgot
router.post('/password/forgot', validate(forgotPasswordSchema), forgotPassword);

// POST /api/auth/password/reset
router.post('/password/reset', validate(resetPasswordSchema), resetPassword);

// ── Login ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// ── User lookup ───────────────────────────────────────────────────────────────
// GET /api/auth/users/:local_id
router.get('/users/:local_id', getUser);

export default router;
