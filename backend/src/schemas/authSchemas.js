import { z } from 'zod';
import {
  ROLES,
  ID_TYPES,
  GENDERS,
  DESIGNATIONS,
  GUARDIAN_RELATIONS,
} from '../config/constants.js';

// ── Reusable field definitions ────────────────────────────────────────────────

const idTypeField = z.enum(Object.values(ID_TYPES), {
  errorMap: () => ({ message: `id_type must be one of: ${Object.values(ID_TYPES).join(', ')}` }),
});

const idNumberField = z.string().trim().min(4).max(20).regex(/^\d+$/, {
  message: 'id_number must contain digits only',
});

const roleField = z.enum(Object.values(ROLES), {
  errorMap: () => ({ message: `role must be one of: ${Object.values(ROLES).join(', ')}` }),
});

const passwordField = z
  .string()
  .min(8, 'password must be at least 8 characters')
  .max(128, 'password must not exceed 128 characters')
  .regex(/[A-Za-z]/, 'password must contain at least one letter')
  .regex(/\d/, 'password must contain at least one number');

const phoneField = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'phone must be a valid 10-digit Indian mobile number')
  .optional()
  .nullable();

// ── id_number cross-validation against id_type ────────────────────────────────

function refineIdNumber(data, ctx) {
  const { id_type, id_number } = data;
  if ((id_type === ID_TYPES.APAAR || id_type === ID_TYPES.AADHAR) && !/^\d{12}$/.test(id_number)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['id_number'],
      message: `id_number must be exactly 12 digits for ${id_type}`,
    });
  }
  if (id_type === ID_TYPES.NSRS && !/^\d{4,20}$/.test(id_number)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['id_number'],
      message: 'id_number must be 4–20 digits for NSRS',
    });
  }
}

// ── Registration ──────────────────────────────────────────────────────────────

export const registerAthleteSchema = z
  .object({
    local_id: z.string().uuid('local_id must be a valid UUID'),
    role: z.literal(ROLES.ATHLETE),
    full_name: z
      .string()
      .trim()
      .min(2, 'full_name must be at least 2 characters')
      .max(50, 'full_name must not exceed 50 characters')
      .regex(/^[A-Za-z]+(\s[A-Za-z]+)*$/, 'full_name must contain letters and spaces only'),
    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'dob must be in YYYY-MM-DD format')
      .refine((d) => !isNaN(Date.parse(d)), { message: 'dob must be a valid date' })
      .refine((d) => new Date(d) < new Date(), { message: 'dob must be in the past' }),
    gender: z.enum(GENDERS, {
      errorMap: () => ({ message: `gender must be one of: ${GENDERS.join(', ')}` }),
    }),
    phone: phoneField,
    id_type: idTypeField,
    id_number: idNumberField,
    school_or_org: z
      .string()
      .trim()
      .min(2, 'school_or_org must be at least 2 characters')
      .max(100),
    guardian_name: z.string().trim().min(2).max(50).optional().nullable(),
    guardian_relation: z
      .enum(GUARDIAN_RELATIONS, {
        errorMap: () => ({
          message: `guardian_relation must be one of: ${GUARDIAN_RELATIONS.join(', ')}`,
        }),
      })
      .optional()
      .nullable(),
    consent_given: z.literal(1, {
      errorMap: () => ({ message: 'consent_given must be 1 (user must accept terms)' }),
    }),
  })
  .superRefine(refineIdNumber);

export const registerCoachSchema = z
  .object({
    local_id: z.string().uuid('local_id must be a valid UUID'),
    role: z.literal(ROLES.COACH),
    full_name: z
      .string()
      .trim()
      .min(2, 'full_name must be at least 2 characters')
      .max(50, 'full_name must not exceed 50 characters')
      .regex(/^[A-Za-z]+(\s[A-Za-z]+)*$/, 'full_name must contain letters and spaces only'),
    gender: z.enum(GENDERS, {
      errorMap: () => ({ message: `gender must be one of: ${GENDERS.join(', ')}` }),
    }),
    phone: phoneField,
    id_type: idTypeField,
    id_number: idNumberField,
    school_or_org: z
      .string()
      .trim()
      .min(2, 'school_or_org must be at least 2 characters')
      .max(100),
    designation: z.enum(Object.values(DESIGNATIONS), {
      errorMap: () => ({
        message: `designation must be one of: ${Object.values(DESIGNATIONS).join(', ')}`,
      }),
    }),
    consent_given: z.literal(1, {
      errorMap: () => ({ message: 'consent_given must be 1 (user must accept terms)' }),
    }),
  })
  .superRefine(refineIdNumber);

// ── OTP verification ──────────────────────────────────────────────────────────

export const verifyOtpSchema = z.object({
  local_id: z.string().uuid('local_id must be a valid UUID'),
  otp_code: z
    .string()
    .length(6, 'otp_code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'otp_code must contain digits only'),
});

// ── Set / Reset password ──────────────────────────────────────────────────────

export const setPasswordSchema = z
  .object({
    local_id: z.string().uuid('local_id must be a valid UUID'),
    password: passwordField,
    confirm_password: z.string().min(1, 'confirm_password is required'),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });

export const resetPasswordSchema = z
  .object({
    local_id: z.string().uuid('local_id must be a valid UUID'),
    password: passwordField,
    confirm_password: z.string().min(1, 'confirm_password is required'),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginSchema = z
  .object({
    id_type: idTypeField,
    id_number: idNumberField,
    password: z.string().min(1, 'password is required'),
    role: roleField,
  })
  .superRefine(refineIdNumber);

// ── Forgot password ───────────────────────────────────────────────────────────

export const forgotPasswordSchema = z
  .object({
    id_type: idTypeField,
    id_number: idNumberField,
    role: roleField,
  })
  .superRefine(refineIdNumber);
