export const WEIGHT_CONFIG = {
  // Numeric bounds
  MIN_WEIGHT_KG: 20.0,
  MAX_WEIGHT_KG: 250.0,

  // OCR Regex rules
  WEIGHT_REGEX: /^\d{2,3}(\.\d{1,2})?$/,

  // Confidence thresholds
  CONFIDENCE_HIGH: 0.95,   // >= 95% -> Auto Accept
  CONFIDENCE_MEDIUM: 0.80, // 80% - 95% -> Confirm with user
                           // < 80% -> Retake Image

  // API Backend URL (defaults to localhost or standard dev host)
  API_BASE_URL: 'http://10.0.2.2:5000/api', // 10.0.2.2 for Android Emulator, localhost for iOS simulator
  
  // SQLite Table
  TABLE_NAME: 'WeightMeasurements',
  
  // Max retries before marking permanently failed in queue
  MAX_RETRY_COUNT: 5
};
