/**
 * All DDL statements executed once at startup.
 * Order matters ΓÇö tables with foreign keys come after their parents.
 */

export const migrations = [
  // ΓöÇΓöÇ users ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // ΓöÇΓöÇ users indexes ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  `CREATE INDEX IF NOT EXISTS idx_users_id_type_id_number
    ON users (id_type, id_number)`,

  `CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role)`,

  `CREATE INDEX IF NOT EXISTS idx_users_sync_status
    ON users (sync_status)`,

  // ΓöÇΓöÇ otp_verifications ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // ΓöÇΓöÇ sync_queue ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // athletes (height offline sync)
  `CREATE TABLE IF NOT EXISTS athletes (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    gender          TEXT,
    date_of_birth   TEXT,
    phone           TEXT,
    height_category TEXT,
    coach_name      TEXT,
    school_academy  TEXT,
    state           TEXT,
    district        TEXT,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL,
    synced_at       TEXT
  )`,

  `CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes (name)`,

  // height_measurements (AI camera test sync)
  `CREATE TABLE IF NOT EXISTS height_measurements (
    measurement_id      TEXT PRIMARY KEY,
    athlete_id          TEXT NOT NULL,
    team_id             TEXT,
    session_id          TEXT,
    height_cm           REAL NOT NULL,
    confidence          REAL NOT NULL,
    device_model        TEXT NOT NULL,
    timestamp           INTEGER NOT NULL,
    calibration_method  TEXT NOT NULL,
    synced_at           TEXT NOT NULL,
    FOREIGN KEY (athlete_id) REFERENCES athletes (id)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_height_measurements_athlete_id
    ON height_measurements (athlete_id)`,

  `CREATE INDEX IF NOT EXISTS idx_height_measurements_timestamp
    ON height_measurements (timestamp)`,

  // weight_measurements (OCR scale sync)
  `CREATE TABLE IF NOT EXISTS weight_measurements (
    id             TEXT    PRIMARY KEY,
    weight         REAL    NOT NULL,
    ocr_confidence REAL    NOT NULL,
    captured_at    TEXT    NOT NULL,
    created_at     TEXT    NOT NULL,
    updated_at     TEXT    NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_weight_captured_at
    ON weight_measurements (captured_at)`,

  // assessments (coach dashboard)
  `CREATE TABLE IF NOT EXISTS assessments (
    id                TEXT PRIMARY KEY,
    coach_id          TEXT NOT NULL,
    title             TEXT NOT NULL,
    class_name        TEXT NOT NULL,
    student_count     INTEGER NOT NULL DEFAULT 0,
    completed_count   INTEGER NOT NULL DEFAULT 0,
    status            TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    created_at        TEXT NOT NULL,
    updated_at        TEXT NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_assessments_coach_id ON assessments (coach_id)`,

  // assessment_tests
  `CREATE TABLE IF NOT EXISTS assessment_tests (
    id                TEXT PRIMARY KEY,
    assessment_id     TEXT NOT NULL REFERENCES assessments (id) ON DELETE CASCADE,
    test_key          TEXT NOT NULL CHECK (test_key IN (
                        'height', 'weight', 'sit_reach', 'vertical_jump',
                        'broad_jump', 'med_ball_throw', 'sprint_30m',
                        'shuttle_4x10', 'sit_ups', 'endurance_run'
                      )),
    test_name         TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'complete')),
    completed_count   INTEGER NOT NULL DEFAULT 0,
    total_students    INTEGER NOT NULL DEFAULT 0,
    best_value        REAL,
    unit              TEXT,
    updated_at        TEXT NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_assessment_tests_assessment ON assessment_tests (assessment_id)`,

  // activity_logs
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id          TEXT PRIMARY KEY,
    coach_id    TEXT NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('test_completed', 'report_generated', 'sync_completed', 'athlete_added')),
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp   TEXT NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_activity_logs_coach ON activity_logs (coach_id, timestamp DESC)`,

  // pending_tasks
  `CREATE TABLE IF NOT EXISTS pending_tasks (
    id          TEXT PRIMARY KEY,
    coach_id    TEXT NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('pending_sync', 'incomplete_assessment', 'generate_report')),
    title       TEXT NOT NULL,
    subtitle    TEXT NOT NULL,
    action_type TEXT NOT NULL,
    action_target TEXT,
    created_at  TEXT NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_pending_tasks_coach ON pending_tasks (coach_id)`,

  // sit_and_reach_tests (SQLite-compatible)
  `CREATE TABLE IF NOT EXISTS sit_and_reach_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    athlete_id INTEGER NOT NULL,
    tester_id INTEGER NOT NULL,
    session_date TEXT NOT NULL,
    trial_1 REAL NOT NULL,
    trial_2 REAL NOT NULL,
    trial_3 REAL NOT NULL,
    score REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'cm',
    notes TEXT,
    is_superseded INTEGER NOT NULL DEFAULT 0,
    superseded_by INTEGER,
    correction_of INTEGER,
    idempotency_key TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (trial_1 BETWEEN -50 AND 100 AND trial_2 BETWEEN -50 AND 100 AND trial_3 BETWEEN -50 AND 100)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_sr_athlete_active_history
    ON sit_and_reach_tests (athlete_id, is_superseded, created_at DESC)`,
];

