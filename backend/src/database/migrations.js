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

  // ── sit_and_reach_tests ───────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS sit_and_reach_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    athlete_id INT NOT NULL,
    tester_id INT NOT NULL,
    session_date DATE NOT NULL,
    trial_1 DECIMAL(5,1) NOT NULL,
    trial_2 DECIMAL(5,1) NOT NULL,
    trial_3 DECIMAL(5,1) NOT NULL,
    score DECIMAL(5,1) NOT NULL,
    unit VARCHAR(10) NOT NULL DEFAULT 'cm',
    notes VARCHAR(500),
    is_superseded BOOLEAN NOT NULL DEFAULT FALSE,
    superseded_by INT DEFAULT NULL,
    correction_of INT DEFAULT NULL,
    idempotency_key VARCHAR(36) UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sr_athlete FOREIGN KEY (athlete_id) REFERENCES athletes(id),
    CONSTRAINT fk_sr_tester FOREIGN KEY (tester_id) REFERENCES users(id),
    CONSTRAINT fk_sr_superseded_by FOREIGN KEY (superseded_by) REFERENCES sit_and_reach_tests(id),
    CONSTRAINT fk_sr_correction_of FOREIGN KEY (correction_of) REFERENCES sit_and_reach_tests(id),
    CONSTRAINT chk_sr_trial_range CHECK (
      trial_1 BETWEEN -50 AND 100 AND
      trial_2 BETWEEN -50 AND 100 AND
      trial_3 BETWEEN -50 AND 100
    )
  )`,

  `CREATE INDEX IF NOT EXISTS idx_sr_athlete_active_history
    ON sit_and_reach_tests (athlete_id, is_superseded, created_at DESC)`,
];

