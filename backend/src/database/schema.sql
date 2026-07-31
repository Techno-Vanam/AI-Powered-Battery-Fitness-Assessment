-- Weight Measurement Database Schema
-- Table: weight_measurements

CREATE DATABASE IF NOT EXISTS fitness_weight_db;
USE fitness_weight_db;

CREATE TABLE IF NOT EXISTS weight_measurements (
  id CHAR(36) PRIMARY KEY,
  weight DECIMAL(5,2) NOT NULL,
  ocr_confidence FLOAT NOT NULL,
  captured_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_captured_at (captured_at),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
