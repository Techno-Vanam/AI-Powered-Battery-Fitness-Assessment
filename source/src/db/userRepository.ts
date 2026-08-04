import { getDBConnection } from './schema';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  local_id?: string;
  server_id?: string | null;
  role: 'athlete' | 'coach';
  full_name: string;
  dob?: string;
  gender: string;
  phone?: string;
  id_type: string;
  id_number: string;
  school_or_org?: string;
  designation?: string;
  guardian_name?: string;
  guardian_relation?: string;
  password_hash?: string | null;
  is_verified?: number;
  consent_given: number;
  created_at?: string;
  updated_at?: string;
  sync_status?: string;
}

export const createUser = (userData: User): string => {
  const db = getDBConnection();
  const existing = getUserByIdentifier(userData.id_type, userData.id_number);
  if (existing?.local_id) {
    return existing.local_id;
  }


  const local_id = uuidv4();
  const now = new Date().toISOString();

  try {
    db.executeSync(
      `INSERT INTO users (
          local_id, role, full_name, dob, gender, phone, id_type, id_number,
          school_or_org, designation, guardian_name, guardian_relation,
          consent_given, created_at, updated_at, sync_status, is_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)`,
      [
        local_id,
        userData.role,
        userData.full_name,
        userData.dob ?? null,
        userData.gender,
        userData.phone ?? null,
        userData.id_type,
        userData.id_number,
        userData.school_or_org ?? null,
        userData.designation ?? null,
        userData.guardian_name ?? null,
        userData.guardian_relation ?? null,
        userData.consent_given,
        now,
        now,
      ]
    );

    // Enqueue for remote sync
    const payload = JSON.stringify({ ...userData, local_id, created_at: now, updated_at: now });
    db.executeSync(
      `INSERT INTO sync_queue (entity_type, entity_local_id, operation, payload, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      ['users', local_id, 'INSERT', payload, now]
    );

    return local_id;
  } catch (error: any) {
    const duplicateUser = getUserByIdentifier(userData.id_type, userData.id_number);
    if (duplicateUser?.local_id) {
      return duplicateUser.local_id;
    }
    throw error;
  }
};

export const getUserByLocalId = (local_id: string): User | null => {
  const db = getDBConnection();
  const result = db.executeSync(
    `SELECT * FROM users WHERE local_id = ? LIMIT 1`,
    [local_id]
  );
  if (result.rows && result.rows.length > 0) {
    return result.rows[0] as unknown as User;
  }
  return null;
};

export const getUserByIdentifier = (
  id_type: string,
  id_number: string,
  role?: string
): User | null => {
  const db = getDBConnection();
  let query = `SELECT * FROM users WHERE id_type = ? AND id_number = ?`;
  const params: any[] = [id_type, id_number];

  if (role) {
    query += ` AND role = ?`;
    params.push(role);
  }
  query += ` LIMIT 1`;

  const result = db.executeSync(query, params);
  if (result.rows && result.rows.length > 0) {
    return result.rows[0] as unknown as User;
  }
  return null;
};

export const markUserVerified = (local_id: string): void => {
  const db = getDBConnection();
  const now = new Date().toISOString();
  db.executeSync(
    `UPDATE users SET is_verified = 1, updated_at = ?, sync_status = 'pending' WHERE local_id = ?`,
    [now, local_id]
  );

  const user = getUserByLocalId(local_id);
  if (user) {
    db.executeSync(
      `INSERT INTO sync_queue (entity_type, entity_local_id, operation, payload, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      ['users', local_id, 'UPDATE', JSON.stringify(user), now]
    );
  }
};

export const updateUserPassword = (local_id: string, password_hash: string): void => {
  const db = getDBConnection();
  const now = new Date().toISOString();

  db.executeSync(
    `UPDATE users SET password_hash = ?, updated_at = ?, sync_status = 'pending' WHERE local_id = ?`,
    [password_hash, now, local_id]
  );

  // Enqueue for remote sync
  const user = getUserByLocalId(local_id);
  if (user) {
    db.executeSync(
      `INSERT INTO sync_queue (entity_type, entity_local_id, operation, payload, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      ['users', local_id, 'UPDATE', JSON.stringify(user), now]
    );
  }
};
