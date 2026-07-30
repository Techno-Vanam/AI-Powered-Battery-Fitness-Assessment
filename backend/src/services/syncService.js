import { getDB } from '../database/db.js';
import * as userRepo from '../repositories/userRepository.js';
import { SYNC_STATUS } from '../config/constants.js';
import { nowISO } from '../utils/date.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Process a bulk sync payload from the mobile app.
 *
 * Each record is either:
 *   - New (local_id not in DB, id_type+id_number not taken)  → INSERT
 *   - Already known by local_id                              → UPDATE
 *   - Conflict (different local_id owns same id_type+id_number) → mark conflict
 *
 * All rows are processed inside a single SQLite transaction.
 * Per-record errors are collected and returned — they do NOT abort the
 * rest of the batch.
 *
 * @param {object[]} users  validated array from bulkSyncSchema
 * @returns {{
 *   synced:   number,
 *   updated:  number,
 *   conflicts: number,
 *   failed:   number,
 *   details:  object[]
 * }}
 */
export function bulkSyncUsers(users) {
  const results = {
    synced:    0,
    updated:   0,
    conflicts: 0,
    failed:    0,
    details:   [],
  };

  const db = getDB();

  const processBatch = db.transaction(() => {
    for (const record of users) {
      try {
        _processSingleUser(record, results);
      } catch (err) {
        results.failed += 1;
        results.details.push({
          local_id: record.local_id,
          status:   'failed',
          reason:   err.message,
        });
      }
    }
  });

  processBatch();

  console.log(
    `[Sync] Processed ${users.length} records — ` +
    `synced=${results.synced} updated=${results.updated} ` +
    `conflicts=${results.conflicts} failed=${results.failed}`
  );

  return results;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Determine and execute the correct action for one incoming user record.
 * Mutates the `results` accumulator.
 *
 * @param {object} record
 * @param {object} results  accumulator
 */
function _processSingleUser(record, results) {
  const now = nowISO();

  // Does this local_id already exist on the server?
  const existingByLocalId = userRepo.findByLocalId(record.local_id);

  if (existingByLocalId) {
    // ── Known user — update mutable fields ───────────────────────────────────
    const upsertRecord = _buildUpsertRecord(record, now, existingByLocalId.server_id);
    userRepo.upsertUser(upsertRecord);

    results.updated += 1;
    results.details.push({
      local_id:  record.local_id,
      server_id: existingByLocalId.server_id,
      status:    'updated',
    });
    return;
  }

  // Check for id_type + id_number collision with a DIFFERENT local_id
  const conflictingUser = userRepo.findByIdentifier(record.id_type, record.id_number);
  if (conflictingUser && conflictingUser.local_id !== record.local_id) {
    // Mark the incoming record as conflicted
    results.conflicts += 1;
    results.details.push({
      local_id:             record.local_id,
      status:               'conflict',
      reason:               `${record.id_type} ${record.id_number} is already registered under a different account.`,
      conflicting_local_id: conflictingUser.local_id,
    });
    return;
  }

  // ── New user — insert and assign server_id ────────────────────────────────
  const server_id    = uuidv4();
  const insertRecord = _buildUpsertRecord(record, now, server_id);
  userRepo.upsertUser(insertRecord);

  results.synced += 1;
  results.details.push({
    local_id:  record.local_id,
    server_id,
    status:    'synced',
  });
}

/**
 * Build a normalised record ready for upsertUser(), merging incoming data
 * with server-side defaults.
 *
 * @param {object}      record     incoming sync payload
 * @param {string}      now        current ISO timestamp
 * @param {string|null} server_id  existing or newly assigned server_id
 * @returns {object}
 */
function _buildUpsertRecord(record, now, server_id) {
  return {
    local_id:          record.local_id,
    server_id:         server_id ?? null,
    role:              record.role,
    full_name:         record.full_name,
    dob:               record.dob              ?? null,
    gender:            record.gender,
    phone:             record.phone            ?? null,
    id_type:           record.id_type,
    id_number:         record.id_number,
    school_or_org:     record.school_or_org    ?? null,
    designation:       record.designation      ?? null,
    guardian_name:     record.guardian_name    ?? null,
    guardian_relation: record.guardian_relation ?? null,
    // Accept the pre-hashed password from device — do NOT re-hash
    password_hash:     record.password_hash    ?? null,
    is_verified:       record.is_verified      ?? 0,
    consent_given:     record.consent_given,
    created_at:        record.created_at,
    updated_at:        now,
    sync_status:       SYNC_STATUS.SYNCED,
  };
}
