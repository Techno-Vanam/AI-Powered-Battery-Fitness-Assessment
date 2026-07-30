-- Battery Fitness Assessment — Database Schema (Draft)
-- Export final schema + ER diagram to docs/DB_Schema.sql or DB_Schema.png before submission

-- ============================================================
-- LOCAL (SQLite / SQLCipher on device)
-- ============================================================

-- Users (athletes and coaches) — see app/src/db/schema.ts for current implementation
-- CREATE TABLE users (...);

-- Sync queue — offline operations pending upload
-- CREATE TABLE sync_queue (...);

-- Assessments, test results, video metadata — to be added
-- CREATE TABLE assessments (...);
-- CREATE TABLE test_results (...);
-- CREATE TABLE video_metadata (...);

-- ============================================================
-- SERVER (backend — better-sqlite3 / production DB)
-- ============================================================

-- See backend/src/database/migrations.js for current server schema

-- TODO: Add complete ER diagram and all tables with PKs, FKs, indexes
