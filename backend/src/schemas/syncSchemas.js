import { z } from 'zod';
import {
  ROLES,
  ID_TYPES,
  GENDERS,
  DESIGNATIONS,
  GUARDIAN_RELATIONS,
  SYNC_STATUS,
} from '../config/constants.js';

// ── Single user record as it arrives from the mobile sync payload ─────────────

const syncUserSchema = z.object({
  local_id: z.string().uuid('local_id must be a valid UUID'),
  server_id: z.string().optional().nullable(),
  role: z.enum(Object.values(ROLES), {
    errorMap: () => ({ message: `role must be one of: ${Object.values(ROLES).join(', ')}` }),
  }),
  full_name: z
    .string()
    .trim()
    .min(2, 'full_name must be at least 2 characters')
    .max(50),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dob must be YYYY-MM-DD')
    .optional()
    .nullable(),
  gender: z.enum(GENDERS, {
    errorMap: () => ({ message: `gender must be one of: ${GENDERS.join(', ')}` }),
  }),
  phone: z.string().optional().nullable(),
  id_type: z.enum(Object.values(ID_TYPES), {
    errorMap: () => ({ message: `id_type must be one of: ${Object.values(ID_TYPES).join(', ')}` }),
  }),
  id_number: z.string().trim().min(4).max(20).regex(/^\d+$/, {
    message: 'id_number must contain digits only',
  }),
  school_or_org: z.string().trim().min(2).max(100).optional().nullable(),
  designation: z
    .enum(Object.values(DESIGNATIONS), {
      errorMap: () => ({
        message: `designation must be one of: ${Object.values(DESIGNATIONS).join(', ')}`,
      }),
    })
    .optional()
    .nullable(),
  guardian_name: z.string().trim().min(2).max(50).optional().nullable(),
  guardian_relation: z
    .enum(GUARDIAN_RELATIONS, {
      errorMap: () => ({
        message: `guardian_relation must be one of: ${GUARDIAN_RELATIONS.join(', ')}`,
      }),
    })
    .optional()
    .nullable(),
  // password_hash is accepted as-is (already hashed on device) — never re-hashed
  password_hash: z.string().optional().nullable(),
  is_verified: z.number().int().min(0).max(1).default(0),
  consent_given: z.number().int().min(0).max(1),
  created_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T/, 'created_at must be an ISO timestamp'),
  updated_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T/, 'updated_at must be an ISO timestamp'),
  sync_status: z
    .enum(Object.values(SYNC_STATUS))
    .optional()
    .nullable(),
});

// ── Bulk sync request ─────────────────────────────────────────────────────────

export const bulkSyncSchema = z.object({
  users: z
    .array(syncUserSchema)
    .min(1, 'users array must contain at least one record')
    .max(500, 'users array must not exceed 500 records per request'),
});
