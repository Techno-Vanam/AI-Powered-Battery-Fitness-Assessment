export interface ValidationResult {
  isValid: boolean;
  weight: number | null;
  confidenceTier: 'AUTO_ACCEPT' | 'USER_CONFIRM' | 'RETAKE_WARNING';
  confidenceScore: number;
  reason?: string;
}

export const WEIGHT_REGEX = /^\d{2,3}(\.\d{1,2})?$/;
export const MIN_WEIGHT_KG = 20.0;
export const MAX_WEIGHT_KG = 250.0;

/**
 * 7-Segment Digital Scale LCD Character Pre-Clean & Disambiguation:
 * Converts common digital LCD segment OCR misinterpretations into numeric digits.
 *
 * Extended disambiguation table:
 * '5B.8kg' -> '58.8'  (B → 8: top-open 8 misread as B)
 * '7O.2'   -> '70.2'  (O → 0: zero misread as letter O)
 * '7D.2'   -> '70.2'  (D → 0: zero with bad contrast misread as D)
 * 'S7.8'   -> '57.8'  (S → 5: mirrored 5 misread as S)
 * 'Z2.4'   -> '22.4'  (Z → 2: 2 misread as Z)
 * '6G.5'   -> '66.5'  (G → 6: LCD 6 with poor segment contrast reads as G)
 * '7q.8'   -> '79.8'  (q → 9: lowercase q misread from 9)
 * '6b.5'   -> '66.5'  (b → 6: lowercase b misread from 6)
 */
export function sanitizeLCDSegmentText(rawText: string): string {
  if (!rawText) return '';

  return rawText
    .replace(/kg|KG|Kg|kG|lb|lbs/gi, ' ')  // Strip unit suffixes
    .replace(/(?<=\d)\s*[:,\-'_~•`"]\s*(?=\d)/g, '.') // Convert colons/commas/hyphens between digits to dots
    .replace(/(?<=\d)\s+\.\s*(?=\d)/g, '.') // Compact spaces before dot
    .replace(/(?<=\d)\s*\.\s+(?=\d)/g, '.') // Compact spaces after dot
    .replace(/\bB\b|(?<=\d)B|B(?=\d)/gi, '8')  // B → 8
    .replace(/\bO\b|(?<=\d)O|O(?=\d)/gi, '0')  // O → 0
    .replace(/\bD\b|(?<=\d)D|D(?=\d)/gi, '0')  // D → 0
    .replace(/\bS\b|(?<=\d)S|S(?=\d)/gi, '5')  // S → 5
    .replace(/\bZ\b|(?<=\d)Z|Z(?=\d)/gi, '2')  // Z → 2
    .replace(/\bI\b|(?<=\d)I|I(?=\d)/gi, '1')  // I → 1
    .replace(/\bL\b|(?<=\d)L|L(?=\d)/gi, '1')  // L → 1
    .replace(/[|!/\\]/g, '1')                  // |, !, /, \ → 1
    .replace(/\bG\b|(?<=\d)G|G(?=\d)/gi, '6')  // G → 6
    .replace(/\bq\b|(?<=\d)q|q(?=\d)/gi, '9')  // q → 9
    .replace(/\bb\b|(?<=\d)b|b(?=\d)/gi, '6')  // b → 6
    .replace(/\bH\b|(?<=\d)H|H(?=\d)/gi, '4')  // H → 4 (7-segment 4 misread)
    .replace(/\bA\b|(?<=\d)A|A(?=\d)/gi, '4')  // A → 4 (7-segment 4 misread)
    .replace(/[^0-9.]/g, ' ')
    .replace(/(?<=\d)\s+(?=\d)/g, '')          // Compact spaces between digits
    .trim();
}

export function extractNumericWeightOnly(rawText: string): number | null {
  if (!rawText) return null;

  const sanitized = sanitizeLCDSegmentText(rawText);
  const tokens = sanitized.split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    const cleanToken = token.replace(/^\.+|\.+$|(?<=\..*)\./g, '');

    // Exact decimal/integer match
    if (WEIGHT_REGEX.test(cleanToken)) {
      const val = parseFloat(cleanToken);
      if (val >= MIN_WEIGHT_KG && val <= MAX_WEIGHT_KG) {
        return val;
      }
    }

    // Appended temperature / digits fallback e.g. "41.224" -> "41.2"
    const match = cleanToken.match(/^(\d{2,3}\.\d{1,2})/);
    if (match) {
      const val = parseFloat(match[1]);
      if (val >= MIN_WEIGHT_KG && val <= MAX_WEIGHT_KG) {
        return val;
      }
    }
  }

  return null;
}

export function validateWeight(
  rawText: string,
  confidence: number
): ValidationResult {
  const extracted = extractNumericWeightOnly(rawText);

  if (extracted === null || confidence < 0.90) {
    return {
      isValid: false,
      weight: extracted,
      confidenceTier: 'RETAKE_WARNING',
      confidenceScore: confidence < 0.90 ? Math.min(confidence, 0.85) : 0.95,
      reason: confidence < 0.90
        ? 'Unable to read weight accurately. OCR confidence below 90%.'
        : `No valid numeric weight between ${MIN_WEIGHT_KG}kg and ${MAX_WEIGHT_KG}kg detected.`,
    };
  }

  return {
    isValid: true,
    weight: extracted,
    confidenceTier: 'AUTO_ACCEPT',
    confidenceScore: 0.98,
  };
}
