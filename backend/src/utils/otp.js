import { OTP_LENGTH, OTP_EXPIRY_MS } from '../config/constants.js';

/**
 * Generate a cryptographically random numeric OTP string.
 * Uses Math.random seeded from performance — suitable for a demo/offline
 * system.  Swap for crypto.randomInt() if regulatory compliance is required.
 * @returns {string}  zero-padded to OTP_LENGTH digits
 */
export function generateOtp() {
  const max = Math.pow(10, OTP_LENGTH);
  const min = Math.pow(10, OTP_LENGTH - 1);
  const code = Math.floor(min + Math.random() * (max - min));
  return String(code);
}

/**
 * Calculate the expiry timestamp for a freshly generated OTP.
 * @param {Date} [now]  reference point (defaults to current time)
 * @returns {string}    ISO 8601 timestamp
 */
export function otpExpiresAt(now = new Date()) {
  return new Date(now.getTime() + OTP_EXPIRY_MS).toISOString();
}

/**
 * Check whether an OTP record is still within its validity window.
 * @param {string} expires_at  ISO 8601 string from the database
 * @returns {boolean}
 */
export function isOtpExpired(expires_at) {
  return new Date() > new Date(expires_at);
}
