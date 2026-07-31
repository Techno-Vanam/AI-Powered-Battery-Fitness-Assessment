const ApiResponse = require('../utils/response');

/**
 * Validates weight measurement payload fields:
 * - weight: numeric, between 20.00 and 250.00
 * - ocr_confidence: numeric between 0.0 and 1.0 (or 0-100)
 * - captured_at: valid date string
 */
function validateWeightMeasurement(req, res, next) {
  const { weight, ocr_confidence, captured_at } = req.body;
  const errors = [];

  const weightNum = parseFloat(weight);
  if (isNaN(weightNum)) {
    errors.push('Weight must be a valid number.');
  } else if (weightNum < 20.0 || weightNum > 250.0) {
    errors.push('Weight must be between 20.00kg and 250.00kg.');
  }

  const confidenceNum = parseFloat(ocr_confidence);
  if (isNaN(confidenceNum) || confidenceNum < 0) {
    errors.push('OCR confidence must be a positive numeric value.');
  }

  if (!captured_at || isNaN(Date.parse(captured_at))) {
    errors.push('Captured_at must be a valid ISO date timestamp string.');
  }

  if (errors.length > 0) {
    return ApiResponse.error(res, 'Validation Failed', 400, errors);
  }

  next();
}

/**
 * Validates bulk sync payload
 */
function validateSyncPayload(req, res, next) {
  const { measurements } = req.body;

  if (!Array.isArray(measurements) || measurements.length === 0) {
    return ApiResponse.error(res, 'Validation Failed: measurements must be a non-empty array.', 400);
  }

  next();
}

module.exports = {
  validateWeightMeasurement,
  validateSyncPayload
};
