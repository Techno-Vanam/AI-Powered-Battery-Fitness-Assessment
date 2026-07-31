import { WEIGHT_CONFIG } from '../constants';

export const CREATE_WEIGHT_MEASUREMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${WEIGHT_CONFIG.TABLE_NAME} (
    id TEXT PRIMARY KEY,
    weight REAL NOT NULL,
    ocrRawText TEXT,
    ocrConfidence REAL NOT NULL,
    capturedImagePath TEXT,
    timestamp TEXT NOT NULL,
    syncStatus TEXT NOT NULL DEFAULT 'Pending',
    retryCount INTEGER NOT NULL DEFAULT 0,
    errorMessage TEXT
  );
`;

export const DROP_WEIGHT_MEASUREMENTS_TABLE = `
  DROP TABLE IF EXISTS ${WEIGHT_CONFIG.TABLE_NAME};
`;
