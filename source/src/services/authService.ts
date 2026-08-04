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
import { markUserSynced } from '../db/syncQueueRepository';

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
 * Registers a new user locally AND pushes to the cloud backend immediately
 * when online. Returns the local_id and generated mock OTP.
 *
 * Flow:
 *  1. Check for an existing local user by identifier.
 *  2. Write to local SQLite (always, offline-first).
 *  3. Attempt POST /auth/register/athlete on the cloud server.
 *     - On success: mark local record as synced.
 *     - On failure / offline: leave sync_status = 'pending' so the
 *       background sync queue retries automatically.
 */
export const registerUser = async (
  payload: RegisterPayload
): { local_id: string; otp: string } => {
  const existing = getUserByIdentifier(payload.id_type, payload.id_number, payload.role);
  if (existing?.local_id) {
    const otp = generateMockOTP(existing.local_id);
    // Attempt cloud sync for existing unsynced user
    void runSyncJob();
    return { local_id: existing.local_id, otp };
  }

  // ── Step 2: Write to local SQLite ─────────────────────────────────────────
  const local_id = createUser(payload);
  const otp = generateMockOTP(local_id);

  // ── Step 3: Push to cloud immediately if online ───────────────────────────
  try {
    const net = await NetInfo.fetch();
    if (net.isConnected && net.isInternetReachable !== false) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const cloudPayload = {
        local_id,
        role: payload.role,
        full_name: payload.full_name,
        dob: payload.dob ?? null,
        gender: payload.gender,
        phone: payload.phone ?? null,
        id_type: payload.id_type,
        id_number: payload.id_number,
        school_or_org: payload.school_or_org ?? null,
        guardian_name: payload.guardian_name ?? null,
        guardian_relation: payload.guardian_relation ?? null,
        consent_given: payload.consent_given,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register/athlete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cloudPayload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const body = await response.json() as { data?: { user?: { server_id?: string } } };
          const server_id = body.data?.user?.server_id ?? '';
          // Mark local record as synced (server_id may be null on first register)
          markUserSynced(local_id, server_id);
          console.log(`[Register] ✓ Athlete ${local_id} saved to cloud (server_id=${server_id || 'pending'})`);
        } else {
          console.warn(`[Register] Cloud register failed (${response.status}), will retry via sync queue`);
          void runSyncJob();
        }
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        console.warn('[Register] Cloud register request failed, will retry via sync queue:', fetchErr?.message);
        void runSyncJob();
      }
    } else {
      // Offline – background sync queue will handle it
      console.log('[Register] Offline — data saved locally, will sync when connected');
    }
  } catch (netErr) {
    console.warn('[Register] Network check failed:', netErr);
    void runSyncJob();
  }

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
  const cleanId = id_number.trim();
  const user = getUserByIdentifier(id_type, cleanId, role);

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

    upsertUserLocally(body.data.user);
    return body.data.user;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw new Error(err.message === 'Account setup incomplete. Please complete registration first.' ? err.message : 'Invalid ID or password.');
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
