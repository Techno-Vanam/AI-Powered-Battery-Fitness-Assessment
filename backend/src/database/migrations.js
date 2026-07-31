/**
 * All DDL statements executed once at startup.
 * Order matters — tables with foreign keys come after their parents.
 */

export const migrations = [
  // ── users ────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS users (
    local_id          TEXT    PRIMARY KEY,
    server_id         TEXT    UNIQUE,
    role              TEXT    NOT NULL CHECK (role IN ('athlete', 'coach')),
    full_name         TEXT    NOT NULL,
    dob               TEXT,
    gender            TEXT    NOT NULL CHECK (gender IN ('M', 'F', 'O')),
    phone             TEXT,
    id_type           TEXT    NOT NULL CHECK (id_type IN ('NSRS', 'APAAR', 'AADHAR')),
    id_number         TEXT    NOT NULL,
    school_or_org     TEXT,
    designation       TEXT    CHECK (designation IN ('coach', 'pe_teacher', 'tidc', 'tizc')),
    guardian_name     TEXT,
    guardian_relation TEXT    CHECK (guardian_relation IN ('Father', 'Mother', 'Legal Guardian')),
    password_hash     TEXT,
    is_verified       INTEGER NOT NULL DEFAULT 0 CHECK (is_verified IN (0, 1)),
    consent_given     INTEGER NOT NULL DEFAULT 0 CHECK (consent_given IN (0, 1)),
    created_at        TEXT    NOT NULL,
    updated_at        TEXT    NOT NULL,
    sync_status       TEXT    NOT NULL DEFAULT 'pending'
                              CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    UNIQUE (id_type, id_number)
  )`,

  // ── users indexes ─────────────────────────────────────────────────────────
  `CREATE INDEX IF NOT EXISTS idx_users_id_type_id_number
    ON users (id_type, id_number)`,

  `CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role)`,

  `CREATE INDEX IF NOT EXISTS idx_users_sync_status
    ON users (sync_status)`,

  // ── otp_verifications ─────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS otp_verifications (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_local_id TEXT    NOT NULL REFERENCES users (local_id) ON DELETE CASCADE,
    otp_code      TEXT    NOT NULL,
    expires_at    TEXT    NOT NULL,
    verified      INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0, 1)),
    created_at    TEXT    NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_otp_user_local_id
    ON otp_verifications (user_local_id)`,

  `CREATE INDEX IF NOT EXISTS idx_otp_expires_at
    ON otp_verifications (expires_at)`,

  // ── sync_queue ────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS sync_queue (
    queue_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type     TEXT    NOT NULL,
    entity_local_id TEXT    NOT NULL,
    operation       TEXT    NOT NULL CHECK (operation IN ('INSERT', 'UPDATE')),
    payload         TEXT    NOT NULL,
    created_at      TEXT    NOT NULL,
    attempts        INTEGER NOT NULL DEFAULT 0
  )`,

  `CREATE INDEX IF NOT EXISTS idx_sync_queue_entity_local_id
    ON sync_queue (entity_local_id)`,

  `CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at
    ON sync_queue (created_at)`,
];
