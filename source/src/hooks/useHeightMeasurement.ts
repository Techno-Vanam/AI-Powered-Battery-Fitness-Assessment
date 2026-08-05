import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type {
  HeightMeasurementAttempt,
  HeightMeasurementStatus,
  HeightPipelineResult,
} from '../height/types/HeightTypes';
import {
  DEFAULT_MARKER_SIZE_CM,
  LOW_CONFIDENCE_THRESHOLD,
  MAX_VIDEO_DURATION_SEC,
  MIN_VIDEO_DURATION_SEC,
} from '../height/config/heightTestConfig';
import { runHeightMeasurementPipeline } from '../height/services/HeightMeasurementPipeline';
import { frameCaptureBuffer } from '../height/detection/FrameCaptureBuffer';

export interface UseHeightMeasurementOptions {
  markerSizeCm?: number;
  onLowConfidence?: (result: HeightPipelineResult) => void;
}

export function useHeightMeasurement(options: UseHeightMeasurementOptions = {}) {
  const markerSizeCm = options.markerSizeCm ?? DEFAULT_MARKER_SIZE_CM;
  const [status, setStatus] = useState<HeightMeasurementStatus>('idle');
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [liveDurationSec, setLiveDurationSec] = useState(0);
  const [result, setResult] = useState<HeightPipelineResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<HeightMeasurementAttempt[]>([]);
  const attemptsRef = useRef<HeightMeasurementAttempt[]>([]);

  useEffect(() => {
    if (status !== 'recording' || recordingStartedAt === null) {
      setLiveDurationSec(0);
      return;
    }
    const tick = () => {
      const elapsed = (Date.now() - recordingStartedAt) / 1000;
      setLiveDurationSec(elapsed);
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [status, recordingStartedAt]);

  const stopRecordingRef = useRef<() => Promise<HeightPipelineResult | null>>(async () => null);

  const startRecording = useCallback(() => {
    frameCaptureBuffer.reset();
    setStatus('recording');
    setRecordingStartedAt(Date.now());
    setErrorMessage(null);
    setResult(null);
  }, []);

  const stopRecording = useCallback(async () => {
    if (recordingStartedAt === null) return null;

    const durationSec = (Date.now() - recordingStartedAt) / 1000;
    setRecordingStartedAt(null);

    if (durationSec < MIN_VIDEO_DURATION_SEC) {
      setStatus('error');
      setErrorMessage(
        `Recording too short (${durationSec.toFixed(1)}s). Please record at least ${MIN_VIDEO_DURATION_SEC} seconds.`,
      );
      return null;
    }

    if (durationSec > MAX_VIDEO_DURATION_SEC) {
      setStatus('error');
      setErrorMessage(
        `Recording too long (${durationSec.toFixed(1)}s). Maximum is ${MAX_VIDEO_DURATION_SEC} seconds.`,
      );
      return null;
    }

    setStatus('processing');

    const captured = frameCaptureBuffer.getCaptured();
    const hasLiveCapture = captured.poses.length > 0 && captured.markers.length > 0;

    const pipelineResult = runHeightMeasurementPipeline(durationSec, {
      markerPhysicalCm: markerSizeCm,
      deviceModel: Platform.OS === 'android' ? 'Android Device' : 'iOS Device',
      captured: hasLiveCapture ? captured : undefined,
    });

    if (!pipelineResult) {
      setStatus('error');
      setErrorMessage('Could not compute height. Ensure marker is visible and subject is fully in frame.');
      return null;
    }

    const attempt: HeightMeasurementAttempt = {
      measurementId: pipelineResult.measurementId,
      heightCm: pipelineResult.heightCm,
      confidence: pipelineResult.confidence,
      timestamp: pipelineResult.timestamp,
      calibrationMethod: pipelineResult.calibrationMethod,
      stableFrameCount: pipelineResult.stableFrameCount,
      videoDurationSec: pipelineResult.videoDurationSec,
    };

    attemptsRef.current = [...attemptsRef.current, attempt];
    setAttempts(attemptsRef.current);
    setResult(pipelineResult);
    setStatus('complete');

    if (pipelineResult.confidence < LOW_CONFIDENCE_THRESHOLD) {
      options.onLowConfidence?.(pipelineResult);
    }

    return pipelineResult;
  }, [recordingStartedAt, markerSizeCm, options]);

  const resetForRetry = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    setResult(null);
    setRecordingStartedAt(null);
  }, []);

  return {
    status,
    result,
    errorMessage,
    attempts,
    markerSizeCm,
    startRecording,
    stopRecording,
    resetForRetry,
    isRecording: status === 'recording',
    isProcessing: status === 'processing',
    recordingDurationSec: liveDurationSec,
    minDurationSec: MIN_VIDEO_DURATION_SEC,
    maxDurationSec: MAX_VIDEO_DURATION_SEC,
    lowConfidenceThreshold: LOW_CONFIDENCE_THRESHOLD,
  };
}
