import bcrypt from 'bcryptjs';
import NetInfo from '@react-native-community/netinfo';
import { fetchApi } from '../config/api';
import {
  createUser,
  getUserByIdentifier,
  updateUserPassword,
  upsertCachedUser,
  User,
} from '../db/userRepository';
import { generateMockOTP } from '../db/otpService';
import { runSyncJob } from './syncService';

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
  const existing = getUserByIdentifier(payload.id_type, payload.id_number, payload.role);
  if (existing?.local_id) {
    const otp = generateMockOTP(existing.local_id);
    return { local_id: existing.local_id, otp };
  }

  const local_id = createUser(payload);
  const otp = generateMockOTP(local_id);

  void runSyncJob();
  return { local_id, otp };
};

/**
 * Local-first login — checks SQLite first; falls back to cloud API when online.
 * Successful cloud logins are cached locally for later offline use.
 */
export const loginUser = async (
  id_type: string,
  id_number: string,
  password: string,
  role: 'athlete' | 'coach'
): Promise<User> => {
  const user = getUserByIdentifier(id_type, id_number, role);

  if (user) {
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
  }

  const net = await NetInfo.fetch();
  if (!net.isConnected || net.isInternetReachable === false) {
    throw new Error('Invalid ID or password.');
  }

  const response = await fetchApi('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_type, id_number, password, role }),
  });

  const body = (await response.json()) as {
    success?: boolean;
    message?: string;
    data?: { user: User };
  };

  if (!response.ok || !body.data?.user) {
    throw new Error(body.message ?? 'Invalid ID or password.');
  }

  const cloudUser = body.data.user;
  const password_hash = await hashPassword(password);

  return upsertCachedUser({
    ...cloudUser,
    role,
    id_type,
    id_number,
    password_hash,
    is_verified: cloudUser.is_verified ?? 1,
    consent_given: cloudUser.consent_given ?? 1,
  });
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
  void runSyncJob();
};
