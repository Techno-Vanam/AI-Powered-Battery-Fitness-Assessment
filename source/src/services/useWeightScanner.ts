import { useState, useRef, useCallback, useEffect } from 'react';
import { Dimensions } from 'react-native';
import type { Camera } from 'react-native-vision-camera';
import { OCRService } from './OCRService';
import {
  SevenSegmentLCDRecognitionEngine,
  TimestampedReading,
} from './SevenSegmentLCDRecognitionEngine';
import { ImageProcessingService, CropRect } from './ImageProcessingService';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Process one frame every 150ms for sub-second real-time scanning. */
const FRAME_INTERVAL_MS = 150;

/** Required matching readings within rolling window (2 consecutive stable readings). */
const REQUIRED_STABLE_FRAMES = 2;

/** Max buffer size of recent readings. */
const MAX_BUFFER_SIZE = 8;

/** Max age of buffer readings before expiration (2000 ms = 2s). */
const MAX_READING_AGE_MS = 2000;

/** ±0.2 kg fuzzy tolerance — allows for normal variance frame-to-frame. */
const WEIGHT_TOLERANCE_KG = 0.2;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ScanStatus = 'idle' | 'searching' | 'reading' | 'stable' | 'error';

export interface ScanState {
  /** Current scanner lifecycle status */
  status: ScanStatus;
  /** Most recent OCR value (changes every frame while reading) */
  currentReading: number | null;
  /** Locked weight — set only when status === 'stable' */
  stableWeight: number | null;
  /** OCR confidence 0–1 */
  confidence: number;
  /** Number of matching frames in active 3s window (0 to REQUIRED_STABLE_FRAMES) */
  consecutiveFrames: number;
  /** Raw OCR text from the current frame */
  rawText: string;
  /** Which engine produced the reading */
  method: 'seven-segment-native' | 'mlkit-ocr' | 'none';
  /** Human-readable status label */
  statusLabel: string;
}

const INITIAL_SCAN_STATE: ScanState = {
  status: 'idle',
  currentReading: null,
  stableWeight: null,
  confidence: 0,
  consecutiveFrames: 0,
  rawText: '',
  method: 'none',
  statusLabel: 'Initializing...',
};

function getStatusLabel(status: ScanStatus, reading: number | null, frames: number): string {
  switch (status) {
    case 'searching': return 'Searching for scale display...';
    case 'reading':   return reading ? `Reading ${reading} kg — ${frames}/${REQUIRED_STABLE_FRAMES} stable` : 'Scanning...';
    case 'stable':    return 'Weight detected!';
    case 'error':     return 'Detection error — retrying...';
    default:          return 'Ready to scan';
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWeightScanner() {
  const [scanState, setScanState] = useState<ScanState>(INITIAL_SCAN_STATE);

  // Internal refs
  const isActive = useRef(false);
  const cameraRefRef = useRef<React.RefObject<Camera> | null>(null);
  const cropRectRef = useRef<CropRect | null>(null);
  const frameHistoryRef = useRef<TimestampedReading[]>([]);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Core frame processor ──────────────────────────────────────────────────
  const runFrame = useCallback(async () => {
    if (!isActive.current) return;

    const camera = cameraRefRef.current?.current;
    const cropRect = cropRectRef.current;

    if (!camera || !cropRect) {
      scheduleNext();
      return;
    }

    let imagePath: string | null = null;
    try {
      // Step 1: Capture frame (takeSnapshot or takePhoto fallback)
      let snapshot;
      try {
        if (typeof (camera as any).takeSnapshot === 'function') {
          snapshot = await camera.takeSnapshot({ quality: 70 });
        } else {
          snapshot = await camera.takePhoto({ flash: 'off' });
        }
      } catch (snapErr) {
        snapshot = await camera.takePhoto({ flash: 'off' });
      }

      if (!snapshot?.path) { scheduleNext(); return; }
      imagePath = snapshot.path.startsWith('file://') ? snapshot.path : `file://${snapshot.path}`;

      // Step 2: Run full OCR pipeline (native 7-seg → ML Kit fallback)
      const result = await OCRService.recognizeLCDWeight(imagePath, undefined, cropRect);

      // Step 3: Delete the temp file immediately — user never sees it in gallery
      await ImageProcessingService.deleteTempImage(imagePath);
      imagePath = null;

      // Step 4: Timestamped consensus check across 3s window (5 matching in 10)
      const consensus = SevenSegmentLCDRecognitionEngine.evaluateTimestampedConsensus(
        result.detectedWeight,
        frameHistoryRef.current,
        Date.now(),
        MAX_READING_AGE_MS,
        REQUIRED_STABLE_FRAMES,
        MAX_BUFFER_SIZE,
        WEIGHT_TOLERANCE_KG
      );
      frameHistoryRef.current = consensus.updatedHistory;

      // Step 5: Derive status
      const status: ScanStatus =
        consensus.isConsensusReached ? 'stable' :
        result.detectedWeight !== null ? 'reading' :
        'searching';

      const frames = consensus.matchCount;

      setScanState({
        status,
        currentReading: result.detectedWeight,
        stableWeight: consensus.stableWeight,
        confidence: result.confidence,
        consecutiveFrames: frames,
        rawText: result.rawText,
        method: result.method,
        statusLabel: getStatusLabel(status, result.detectedWeight, frames),
      });

      // Stop loop when stable — caller handles navigation
      if (consensus.isConsensusReached) {
        isActive.current = false;
        return;
      }

    } catch (err) {
      console.warn('[useWeightScanner] Frame error:', err);
      if (imagePath) {
        await ImageProcessingService.deleteTempImage(imagePath).catch(() => {});
      }
      setScanState(prev => ({
        ...prev,
        status: 'error',
        statusLabel: 'Detection error — retrying...',
      }));
    }

    scheduleNext();
  }, []);

  function scheduleNext() {
    if (!isActive.current) return;
    scanTimerRef.current = setTimeout(runFrame, FRAME_INTERVAL_MS);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  const updateCropRect = useCallback((newRect: CropRect) => {
    cropRectRef.current = newRect;
  }, []);

  const startScanning = useCallback(
    (cameraRef: React.RefObject<Camera>, cropRect: CropRect) => {
      frameHistoryRef.current = [];
      cameraRefRef.current = cameraRef;
      cropRectRef.current = cropRect;
      isActive.current = true;

      setScanState({
        ...INITIAL_SCAN_STATE,
        status: 'searching',
        statusLabel: 'Searching for scale display...',
      });

      runFrame();
    },
    [runFrame]
  );

  const stopScanning = useCallback(() => {
    isActive.current = false;
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  }, []);

  const resetScanning = useCallback(
    (cameraRef: React.RefObject<Camera>, cropRect: CropRect) => {
      stopScanning();
      setTimeout(() => startScanning(cameraRef, cropRect), 100);
    },
    [startScanning, stopScanning]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActive.current = false;
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, []);

  return {
    scanState,
    startScanning,
    stopScanning,
    resetScanning,
    updateCropRect,
    REQUIRED_STABLE_FRAMES,
  };
}
