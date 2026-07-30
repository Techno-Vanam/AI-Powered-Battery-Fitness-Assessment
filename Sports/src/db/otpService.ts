import { getDBConnection } from './schema';

export const generateMockOTP = (user_local_id: string): string => {
  const db = getDBConnection();
  const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 5 * 60_000).toISOString();

  db.execute(
    `INSERT INTO otp_verifications (user_local_id, otp_code, expires_at) VALUES (?, ?, ?)`,
    [user_local_id, otp_code, expires_at]
  );

  return otp_code;
};

export const getLatestOTP = (user_local_id: string): string | null => {
  const db = getDBConnection();
  const result = db.execute(
    `SELECT otp_code FROM otp_verifications
       WHERE user_local_id = ?
       ORDER BY id DESC LIMIT 1`,
    [user_local_id]
  );
  if (result.rows && result.rows.length > 0) {
    return result.rows.item(0).otp_code as string;
  }
  return null;
};

export const verifyOTP = (user_local_id: string, otp_code: string): boolean => {
  const db = getDBConnection();
  const result = db.execute(
    `SELECT id, expires_at, verified FROM otp_verifications
       WHERE user_local_id = ? AND otp_code = ?
       ORDER BY id DESC LIMIT 1`,
    [user_local_id, otp_code]
  );

  if (result.rows && result.rows.length > 0) {
    const record = result.rows.item(0);
    const now = new Date();
    const expiresAt = new Date(record.expires_at);

    if (now <= expiresAt && record.verified === 0) {
      db.execute(
        `UPDATE otp_verifications SET verified = 1 WHERE id = ?`,
        [record.id]
      );
      return true;
    }
  }
  return false;
};
