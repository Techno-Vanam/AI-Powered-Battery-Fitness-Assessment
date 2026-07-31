import * as userRepo from '../repositories/userRepository.js';
import { SYNC_STATUS } from '../config/constants.js';
import { nowISO } from '../utils/date.js';
import { v4 as uuidv4 } from 'uuid';
import { withTransaction } from '../database/db.js';

export async function bulkSyncUsers(users) {
  const results = {
    synced: 0,
    updated: 0,
    conflicts: 0,
    failed: 0,
    details: [],
  };

  await withTransaction(async () => {
    for (const record of users) {
      try {
        await _processSingleUser(record, results);
      } catch (err) {
        results.failed += 1;
        results.details.push({
          local_id: record.local_id,
          status: 'failed',
          reason: err.message,
        });
      }
    }
  });

  console.log(
    `[Sync] Processed ${users.length} records — ` +
      `synced=${results.synced} updated=${results.updated} ` +
      `conflicts=${results.conflicts} failed=${results.failed}`
  );

  return results;
}

async function _processSingleUser(record, results) {
  const now = nowISO();
  const existingByLocalId = await userRepo.findByLocalId(record.local_id);

  if (existingByLocalId) {
    const upsertRecord = _buildUpsertRecord(record, now, existingByLocalId.server_id);
    await userRepo.upsertUser(upsertRecord);
    results.updated += 1;
    results.details.push({
      local_id: record.local_id,
      server_id: existingByLocalId.server_id,
      status: 'updated',
    });
    return;
  }

  const conflictingUser = await userRepo.findByIdentifier(record.id_type, record.id_number);
  if (conflictingUser && conflictingUser.local_id !== record.local_id) {
    results.conflicts += 1;
    results.details.push({
      local_id: record.local_id,
      status: 'conflict',
      reason: `${record.id_type} ${record.id_number} is already registered under a different account.`,
      conflicting_local_id: conflictingUser.local_id,
    });
    return;
  }

  const server_id = uuidv4();
  const insertRecord = _buildUpsertRecord(record, now, server_id);
  await userRepo.upsertUser(insertRecord);

  results.synced += 1;
  results.details.push({
    local_id: record.local_id,
    server_id,
    status: 'synced',
  });
}

function _buildUpsertRecord(record, now, server_id) {
  return {
    local_id: record.local_id,
    server_id: server_id ?? null,
    role: record.role,
    full_name: record.full_name,
    dob: record.dob ?? null,
    gender: record.gender,
    phone: record.phone ?? null,
    id_type: record.id_type,
    id_number: record.id_number,
    school_or_org: record.school_or_org ?? null,
    designation: record.designation ?? null,
    guardian_name: record.guardian_name ?? null,
    guardian_relation: record.guardian_relation ?? null,
    password_hash: record.password_hash ?? null,
    is_verified: record.is_verified ?? 0,
    consent_given: record.consent_given,
    created_at: record.created_at,
    updated_at: now,
    sync_status: SYNC_STATUS.SYNCED,
  };
}
