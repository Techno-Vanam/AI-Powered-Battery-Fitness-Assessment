import { ValidationResult, ConfidenceCategory } from '../types';
import { WEIGHT_CONFIG } from '../constants';

class WeightValidationService {
  /**
   * Validate a detected weight string and confidence score
   */
  validate(rawText: string, confidence: number): ValidationResult {
    const cleanedText = rawText.replace(/[^\d.]/g, '').trim();

    if (!cleanedText) {
      return {
        isValid: false,
        weight: null,
        confidence,
        category: 'RETAKE',
        message: 'No numeric digits recognized on LCD display.'
      };
    }

    // 1. Regex validation
    const matchesRegex = WEIGHT_CONFIG.WEIGHT_REGEX.test(cleanedText);
    if (!matchesRegex) {
      return {
        isValid: false,
        weight: null,
        confidence,
        category: 'RETAKE',
        message: `Extracted text "${rawText}" does not match weight format (e.g., 72.5 or 80).`
      };
    }

    const weightNum = parseFloat(cleanedText);

    // 2. Numeric range validation (20kg to 250kg)
    if (isNaN(weightNum) || weightNum < WEIGHT_CONFIG.MIN_WEIGHT_KG || weightNum > WEIGHT_CONFIG.MAX_WEIGHT_KG) {
      return {
        isValid: false,
        weight: weightNum,
        confidence,
        category: 'RETAKE',
        message: `Weight ${weightNum}kg is outside valid athletic bounds (${WEIGHT_CONFIG.MIN_WEIGHT_KG}kg - ${WEIGHT_CONFIG.MAX_WEIGHT_KG}kg).`
      };
    }

    // 3. OCR Confidence Thresholding
    let category: ConfidenceCategory = 'ACCEPT';
    let message = 'High confidence reading. Automatically accepted.';

    if (confidence >= WEIGHT_CONFIG.CONFIDENCE_HIGH) {
      category = 'ACCEPT';
      message = 'High confidence reading (>= 95%). Automatically accepted.';
    } else if (confidence >= WEIGHT_CONFIG.CONFIDENCE_MEDIUM) {
      category = 'CONFIRM';
      message = 'Moderate confidence reading (80% - 95%). Please confirm value.';
    } else {
      category = 'RETAKE';
      message = 'Low OCR confidence (< 80%). Retake photo for accurate reading.';
    }

    return {
      isValid: true,
      weight: weightNum,
      confidence,
      category,
      message
    };
  }

  /**
   * Categorize OCR confidence level into ACCEPT, CONFIRM, or RETAKE
   */
  getCategorizedConfidence(confidence: number): ConfidenceCategory {
    if (confidence >= WEIGHT_CONFIG.CONFIDENCE_HIGH) return 'ACCEPT';
    if (confidence >= WEIGHT_CONFIG.CONFIDENCE_MEDIUM) return 'CONFIRM';
    return 'RETAKE';
  }
}

export default new WeightValidationService();
