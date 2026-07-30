// ── OTP ──────────────────────────────────────────────────────────────────────
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;

// ── User roles ────────────────────────────────────────────────────────────────
export const ROLES = Object.freeze({
  ATHLETE: 'athlete',
  COACH: 'coach',
});

// ── ID types ──────────────────────────────────────────────────────────────────
export const ID_TYPES = Object.freeze({
  NSRS: 'NSRS',
  APAAR: 'APAAR',
  AADHAR: 'AADHAR',
});

// ── Designations (coach only) ─────────────────────────────────────────────────
export const DESIGNATIONS = Object.freeze({
  COACH: 'coach',
  PE_TEACHER: 'pe_teacher',
  TIDC: 'tidc',
  TIZC: 'tizc',
});

// ── Sync statuses ─────────────────────────────────────────────────────────────
export const SYNC_STATUS = Object.freeze({
  PENDING: 'pending',
  SYNCED: 'synced',
  CONFLICT: 'conflict',
});

// ── Sync operations ───────────────────────────────────────────────────────────
export const SYNC_OPERATIONS = Object.freeze({
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
});

// ── Gender values ─────────────────────────────────────────────────────────────
export const GENDERS = Object.freeze(['M', 'F', 'O']);

// ── Guardian relations ────────────────────────────────────────────────────────
export const GUARDIAN_RELATIONS = Object.freeze([
  'Father',
  'Mother',
  'Legal Guardian',
]);

// ── HTTP status codes ─────────────────────────────────────────────────────────
export const HTTP = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
});
