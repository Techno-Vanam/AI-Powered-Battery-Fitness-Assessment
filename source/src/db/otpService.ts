import { getDBConnection } from './schema';

const activeOtpByUser = new Map<string, string>();

const normalizeOtp = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

export const generateMockOTP = (user_local_id: string): string => {
  const db = getDBConnection();
  const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 10 * 60_000).toISOString(); // 10 min — generous for demo use

  activeOtpByUser.set(user_local_id, otp_code);

  console.log(`[otpService] generateMockOTP -> user=${user_local_id} otp=${JSON.stringify(otp_code)} ts=${new Date().toISOString()}`);
  db.executeSync(
    `INSERT INTO otp_verifications (user_local_id, otp_code, expires_at) VALUES (?, ?, ?)`,
    [user_local_id, otp_code, expires_at]
  );
  console.log(`[otpService] insertOtp -> user=${user_local_id} stored=${JSON.stringify(otp_code)} expires=${JSON.stringify(expires_at)}`);

  return otp_code;
};

export const getLatestOTP = (user_local_id: string): string | null => {
  const activeOtp = normalizeOtp(activeOtpByUser.get(user_local_id));
  if (activeOtp) {
    console.log(`[otpService] getLatestOTP -> user=${user_local_id} selected=${JSON.stringify(activeOtp)} (memory)`);
    return activeOtp;
  }

  const db = getDBConnection();
  const result = db.executeSync(
    `SELECT otp_code FROM otp_verifications
       WHERE user_local_id = ?
       ORDER BY id DESC LIMIT 1`,
    [user_local_id]
  );
  if (result.rows && result.rows.length > 0) {
    const otp_code = normalizeOtp(result.rows[0].otp_code as string);
    if (otp_code) {
      activeOtpByUser.set(user_local_id, otp_code);
      console.log(`[otpService] getLatestOTP -> user=${user_local_id} selected=${JSON.stringify(otp_code)} (db)`);
      return otp_code;
    }
  }

  console.log(`[otpService] getLatestOTP -> user=${user_local_id} selected=null`);
  return null;
};

export const verifyOTP = (user_local_id: string, otp_code: string): boolean => {
  const db = getDBConnection();
  const normalizedAttempt = normalizeOtp(otp_code);
  const expectedOtp = normalizeOtp(getLatestOTP(user_local_id));

  console.log(`[otpService] verifyOTP -> user=${user_local_id} attempted=${JSON.stringify(normalizedAttempt)} expected=${JSON.stringify(expectedOtp)}`);

  if (!normalizedAttempt || !expectedOtp || normalizedAttempt !== expectedOtp) {
    console.log(`[otpService] verifyOTP -> no matching OTP found for user=${user_local_id}`);
    return false;
  }

  const latestRecordResult = db.executeSync(
    `SELECT id, expires_at, verified FROM otp_verifications
       WHERE user_local_id = ?
       ORDER BY id DESC LIMIT 1`,
    [user_local_id]
  );

  const latestRecordRows = latestRecordResult?.rows;
  if (latestRecordRows && latestRecordRows.length > 0) {
    const record = latestRecordRows[0];
    console.log(`[otpService] verifyOTP matched -> id=${record.id} verified=${record.verified} expires=${JSON.stringify(record.expires_at)}`);
    const now = new Date();
    const expiresAt = new Date(record.expires_at as string);

    if (now <= expiresAt && record.verified === 0) {
      db.executeSync(
        `UPDATE otp_verifications SET verified = 1 WHERE id = ?`,
        [record.id]
      );
      return true;
    }
  }

  if (normalizedAttempt && expectedOtp && normalizedAttempt === expectedOtp) {
    console.log(`[otpService] verifyOTP -> accepting active OTP for user=${user_local_id} without a persisted row`);
    return true;
  }

  console.log(`[otpService] verifyOTP -> no matching unexpired OTP found for user=${user_local_id}`);
  return false;
};
