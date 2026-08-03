import { validateWeight, ValidationResult } from './WeightValidationService';
import { SegmentState, NativeSegmentResult } from './SevenSegmentNativeBridge';

export type { SegmentState };

export interface FrameConsensusState {
  history: number[];
  requiredConsecutive: number;
  currentStableWeight: number | null;
  isConsensusReached: boolean;
}

export interface TimestampedReading {
  weight: number;
  timestamp: number;
}

export const SevenSegmentLCDRecognitionEngine = {
  /**
   * Maps a 7-Segment LCD Display state matrix to a numeric character (0-9).
   *
   * Standard seven-segment layout:
   *  ─ a ─
   * b     c
   *  ─ d ─
   * e     f
   *  ─ g ─
   */
  decodeSegmentToDigit(seg: SegmentState): string | null {
    const { a, b, c, d, e, f, g } = seg;

    if (a && b && c && !d && e && f && g) return '0';
    if (!a && !b && c && !d && !e && f && !g) return '1';
    if (a && !b && c && d && e && !f && g) return '2';
    if (a && !b && c && d && !e && f && g) return '3';
    if (!a && b && c && d && !e && f && !g) return '4';
    if (a && b && !c && d && !e && f && g) return '5';
    if (a && b && !c && d && e && f && g) return '6';
    if (a && !b && c && !d && !e && f && g) return '7';
    if (a && b && c && d && e && f && g) return '8';
    if (a && b && c && d && !e && f && g) return '9';

    return null;
  },

  /**
   * Assembles a numeric weight string from native seven-segment analysis output.
   */
  assembleWeightFromSegments(result: NativeSegmentResult): string | null {
    const { digits, decimalAfterIndex } = result;
    if (!digits || digits.length === 0) return null;

    // Decode each segment state to a character
    const digitChars: (string | null)[] = digits.map((seg) =>
      this.decodeSegmentToDigit(seg)
    );

    // If any digit is completely unreadable, bail out
    if (digitChars.some((ch) => ch === null)) {
      if (digits.length < 3 || digitChars.filter((c) => c === null).length > 1) {
        return null;
      }
    }

    const chars = digitChars.map((c) => c ?? '?');

    // Case 1: Native module detected a decimal point
    if (decimalAfterIndex !== null && decimalAfterIndex >= 0 && decimalAfterIndex < chars.length - 1) {
      const assembled = [
        ...chars.slice(0, decimalAfterIndex + 1),
        '.',
        ...chars.slice(decimalAfterIndex + 1),
      ].join('');

      const validated = this._validateWeightString(assembled);
      if (validated) return validated;
    }

    // Case 2: No decimal detected — try all possible decimal positions
    const rawStr = chars.join('');
    const tryPositions =
      rawStr.length === 3
        ? [2, 1]
        : rawStr.length === 4
        ? [3, 2]
        : [rawStr.length - 1, rawStr.length - 2];

    for (const pos of tryPositions) {
      if (pos <= 0 || pos >= rawStr.length) continue;
      const candidate = rawStr.slice(0, pos) + '.' + rawStr.slice(pos);
      const validated = this._validateWeightString(candidate);
      if (validated) return validated;
    }

    // Case 3: Whole-number display
    const validated = this._validateWeightString(rawStr);
    if (validated) return validated;

    return null;
  },

  /**
   * Internal helper: validates that a string represents a plausible human weight.
   * Accepts: 2-3 digits, optional decimal with 1-2 fractional digits, 20–250 kg.
   */
  _validateWeightString(str: string): string | null {
    if (!/^\d{2,3}(\.\d{1,2})?$/.test(str)) return null;
    const val = parseFloat(str);
    if (val >= 20.0 && val <= 250.0) return str;
    return null;
  },

  /**
   * Parses 7-Segment LCD digital scale OCR text (ML Kit fallback path).
   * Disambiguates LCD segment shapes and extracts exact numeric weight value.
   */
  parseSevenSegmentLCDWeight(rawInput: string): { weight: number | null; rawCleaned: string } {
    if (!rawInput) return { weight: null, rawCleaned: '' };

    // 1. Disambiguate LCD character shapes & decimal separators into numbers
    const disambiguated = rawInput
      .replace(/kg|KG|Kg|kG|g|G|lb|lbs/gi, ' ')
      .replace(/(?<=\d)\s*[:,\-'_~•`"]\s*(?=\d)/g, '.') // Colons, commas, hyphens between digits -> dots
      .replace(/(?<=\d)\s+\.\s*(?=\d)/g, '.')
      .replace(/(?<=\d)\s*\.\s+(?=\d)/g, '.')
      .replace(/\bB\b|(?<=\d)B|B(?=\d)/gi, '8')
      .replace(/\bO\b|(?<=\d)O|O(?=\d)/gi, '0')
      .replace(/\bD\b|(?<=\d)D|D(?=\d)/gi, '0')
      .replace(/\bS\b|(?<=\d)S|S(?=\d)/gi, '5')
      .replace(/\bZ\b|(?<=\d)Z|Z(?=\d)/gi, '2')
      .replace(/\bI\b|(?<=\d)I|I(?=\d)/gi, '1')
      .replace(/\bL\b|(?<=\d)L|L(?=\d)/gi, '1')
      .replace(/[|!/\\]/g, '1')
      .replace(/\bG\b|(?<=\d)G|G(?=\d)/gi, '6')
      .replace(/\bq\b|(?<=\d)q|q(?=\d)/gi, '9')
      .replace(/\bb\b|(?<=\d)b|b(?=\d)/gi, '6')
      .replace(/\bH\b|(?<=\d)H|H(?=\d)/gi, '4')
      .replace(/\bA\b|(?<=\d)A|A(?=\d)/gi, '4');

    // 2. Replace non-numeric/non-dot with space (preserve word/token boundaries!)
    const cleanedText = disambiguated
      .replace(/[^0-9.]/g, ' ')
      .replace(/(?<=\d)\s+(?=\d)/g, '')
      .trim();
    const tokens = cleanedText.split(/\s+/).filter(Boolean);

    for (const token of tokens) {
      // Remove leading/trailing dots
      const sanitizedToken = token.replace(/^\.+|\.+$|(?<=\..*)\.+/g, '');

      // Direct exact match: e.g. "56.35" or "68.5"
      if (/^\d{2,3}(\.\d{1,2})?$/.test(sanitizedToken)) {
        const parsedWeight = parseFloat(sanitizedToken);
        if (parsedWeight >= 20.0 && parsedWeight <= 250.0) {
          return { weight: parsedWeight, rawCleaned: sanitizedToken };
        }
      }

      // Appended temperature fallback: e.g. "56.3524" -> extract "56.35"
      const match = sanitizedToken.match(/^(\d{2,3}\.\d{1,2})/);
      if (match) {
        const parsedWeight = parseFloat(match[1]);
        if (parsedWeight >= 20.0 && parsedWeight <= 250.0) {
          return { weight: parsedWeight, rawCleaned: match[1] };
        }
      }
    }

    return { weight: null, rawCleaned: cleanedText };
  },

  /**
   * Timestamped Multi-Frame Consensus Voting Engine.
   *
   * 1. Discard readings older than maxAgeMs (default: 3000 ms = 3 seconds).
   * 2. Buffer up to maxBufferSize (default: 10 readings).
   * 3. Requires at least requiredMatches (default: 5) readings within ±toleranceKg (default: 0.2 kg).
   */
  evaluateTimestampedConsensus(
    currentWeight: number | null,
    history: TimestampedReading[],
    now: number = Date.now(),
    maxAgeMs: number = 3000,
    requiredMatches: number = 5,
    maxBufferSize: number = 10,
    toleranceKg: number = 0.2
  ): {
    isConsensusReached: boolean;
    stableWeight: number | null;
    updatedHistory: TimestampedReading[];
    matchCount: number;
  } {
    // 1. Purge stale entries older than maxAgeMs
    const activeHistory = history.filter((item) => now - item.timestamp <= maxAgeMs);

    if (currentWeight === null) {
      return {
        isConsensusReached: false,
        stableWeight: null,
        updatedHistory: activeHistory,
        matchCount: 0,
      };
    }

    // 2. Append new reading & cap buffer size
    const updatedHistory = [...activeHistory, { weight: currentWeight, timestamp: now }].slice(-maxBufferSize);

    // 3. Find largest cluster of values within ±toleranceKg
    const weights = updatedHistory.map((item) => item.weight);
    let bestCluster: number[] = [];

    for (const target of weights) {
      const cluster = weights.filter((w) => Math.abs(w - target) <= toleranceKg);
      if (cluster.length > bestCluster.length) {
        bestCluster = cluster;
      }
    }

    const matchCount = bestCluster.length;
    const isConsensusReached = matchCount >= requiredMatches;

    // Median of best cluster is selected as stable weight
    const sortedCluster = [...bestCluster].sort((a, b) => a - b);
    const stableWeight = isConsensusReached
      ? sortedCluster[Math.floor(sortedCluster.length / 2)]
      : null;

    return {
      isConsensusReached,
      stableWeight,
      updatedHistory,
      matchCount,
    };
  },

  /**
   * Multi-Frame Stabilization Engine (Legacy Wrapper for backwards compatibility).
   */
  evaluateFrameConsensus(
    currentFrameWeight: number | null,
    existingHistory: number[],
    requiredFrames: number = 3,
    toleranceKg: number = 0.2
  ): {
    isConsensusReached: boolean;
    stableWeight: number | null;
    updatedHistory: number[];
    consecutiveMatchesCount: number;
  } {
    const fakeTimestamped: TimestampedReading[] = existingHistory.map((w, i) => ({
      weight: w,
      timestamp: Date.now() - (existingHistory.length - i) * 200,
    }));

    const result = this.evaluateTimestampedConsensus(
      currentFrameWeight,
      fakeTimestamped,
      Date.now(),
      10000,
      requiredFrames,
      requiredFrames * 2,
      toleranceKg
    );

    return {
      isConsensusReached: result.isConsensusReached,
      stableWeight: result.stableWeight,
      updatedHistory: result.updatedHistory.map((item) => item.weight),
      consecutiveMatchesCount: result.matchCount,
    };
  },
};
