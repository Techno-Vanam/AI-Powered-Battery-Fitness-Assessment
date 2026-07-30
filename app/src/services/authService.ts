import bcrypt from 'bcryptjs';
import {
  createUser,
  getUserByIdentifier,
  updateUserPassword,
  User,
} from '../db/userRepository';
import { generateMockOTP } from '../db/otpService';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export interface RegisterPayload
  extends Omit<User, 'local_id' | 'password_hash' | 'is_verified'> {}

/**
 * Registers a new user locally. Returns the local_id and generated mock OTP.
 * All writes go to SQLite synchronously; bcrypt is the only async step.
 */
export const registerUser = (
  payload: RegisterPayload
): { local_id: string; otp: string } => {
  const existing = getUserByIdentifier(payload.id_type, payload.id_number);
  if (existing?.local_id) {
    const otp = generateMockOTP(existing.local_id);
    return { local_id: existing.local_id, otp };
  }

  const local_id = createUser(payload);
  const otp = generateMockOTP(local_id);

  return { local_id, otp };
};

/**
 * Local-first login — always checks SQLite first; works fully offline.
 */
export const loginUser = async (
  id_type: string,
  id_number: string,
  password: string,
  role: 'athlete' | 'coach'
): Promise<User> => {
  const user = getUserByIdentifier(id_type, id_number, role);

  if (!user) {
    throw new Error('Invalid ID or password.');
  }

  if (!user.password_hash) {
    throw new Error(
      'Account setup incomplete. Please complete registration first.'
    );
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid ID or password.');
  }

  return user;
};

/**
 * Hashes and saves a new password for the given local_id.
 */
export const setUserPassword = async (
  local_id: string,
  newPassword: string
): Promise<void> => {
  const passwordHash = await hashPassword(newPassword);
  updateUserPassword(local_id, passwordHash);
};
