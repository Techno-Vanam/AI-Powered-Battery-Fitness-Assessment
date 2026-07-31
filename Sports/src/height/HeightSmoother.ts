import type { SmoothedHeight } from './HeightTypes';
import {
  ROLLING_WINDOW_SIZE,
  MEDIAN_WINDOW_SIZE,
  STABILITY_WINDOW_MS,
  STABILITY_MAX_VARIANCE,
  MAX_FRAME_JUMP_CM,
} from './HeightTypes';

// ─── Math helpers ─────────────────────────────────────────────────────────────

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// ─── HeightSmoother ───────────────────────────────────────────────────────────
/**
 * Stateful smoother that maintains a rolling window of height samples.
 *
 * On each call to push():
 *  1. Reject if the new value jumps more than MAX_FRAME_JUMP_CM from the
 *     current median (motion blur / detection glitch).
 *  2. Add to the rolling window (capped at ROLLING_WINDOW_SIZE).
 *  3. Compute median of the last MEDIAN_WINDOW_SIZE samples.
 *  4. Compute rolling mean of the full window.
 *  5. Determine stability: std-dev of the window ≤ STABILITY_MAX_VARIANCE
 *     AND the window has been stable for ≥ STABILITY_WINDOW_MS.
 */
export class HeightSmoother {
  private readonly rollingWindow: number[] = [];
  private stableStartMs: number | null = null;
  private lastMedian: number = 0;

  /** Push a new raw height sample. Returns the smoothed result. */
  push(rawHeightCm: number, nowMs: number = Date.now()): SmoothedHeight {
    // ── Jump rejection ────────────────────────────────────────────────────────
    if (this.rollingWindow.length >= 3) {
      const currentMedian = median(this.rollingWindow.slice(-MEDIAN_WINDOW_SIZE));
      if (Math.abs(rawHeightCm - currentMedian) > MAX_FRAME_JUMP_CM) {
        // Reject this sample — return last known smoothed value
        return this.currentResult(nowMs);
      }
    }

    // ── Add to window ─────────────────────────────────────────────────────────
    this.rollingWindow.push(rawHeightCm);
    if (this.rollingWindow.length > ROLLING_WINDOW_SIZE) {
      this.rollingWindow.shift();
    }

    // ── Median filter ─────────────────────────────────────────────────────────
    const recentSamples = this.rollingWindow.slice(-MEDIAN_WINDOW_SIZE);
    this.lastMedian = median(recentSamples);

    // ── Stability check ───────────────────────────────────────────────────────
    const sd = stdDev(this.rollingWindow);
    const isCurrentlyStable = sd <= STABILITY_MAX_VARIANCE &&
                              this.rollingWindow.length >= MEDIAN_WINDOW_SIZE;

    if (isCurrentlyStable) {
      if (this.stableStartMs === null) {
        this.stableStartMs = nowMs;
      }
    } else {
      this.stableStartMs = null;
    }

    return this.currentResult(nowMs);
  }

  private currentResult(nowMs: number): SmoothedHeight {
    const stableForMs = this.stableStartMs !== null
      ? nowMs - this.stableStartMs
      : 0;

    return {
      heightCm:    Math.round(this.lastMedian * 10) / 10,
      isStable:    stableForMs >= STABILITY_WINDOW_MS,
      stableForMs,
      sampleCount: this.rollingWindow.length,
    };
  }

  /** Reset all state (e.g. when the person leaves the frame). */
  reset(): void {
    this.rollingWindow.length = 0;
    this.stableStartMs = null;
    this.lastMedian = 0;
  }

  /** Current smoothed height without pushing a new sample. */
  get current(): number {
    return this.lastMedian;
  }

  /** Number of samples in the window. */
  get sampleCount(): number {
    return this.rollingWindow.length;
  }
}
