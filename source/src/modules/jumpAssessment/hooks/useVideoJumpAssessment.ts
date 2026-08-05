/**
 * Custom React Hook for Airtime-based Jump Assessment with Frame-by-Frame Scrubber
 */

import { useState, useCallback, useMemo } from 'react';
import { flightTimeEngine, AirtimeJumpMetrics } from '../services/flightTimeEngine';

export interface UseVideoJumpAssessmentOptions {
  fps?: number; // 30, 60, 120, 240
  athleteMassKg?: number;
}

export function useVideoJumpAssessment(options: UseVideoJumpAssessmentOptions = {}) {
  const { fps = 60, athleteMassKg = 70.0 } = options;

  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number>(0);
  const [currentPositionMs, setCurrentPositionMs] = useState<number>(0);
  const [takeoffFrameMs, setTakeoffFrameMs] = useState<number | null>(null);
  const [landingFrameMs, setLandingFrameMs] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const frameTimeMs = useMemo(() => 1000.0 / fps, [fps]);

  /**
   * Quantizes a raw timestamp to the nearest frame step for current FPS
   */
  const quantizeToFrame = useCallback(
    (timestampMs: number): number => {
      const frameIndex = Math.round(timestampMs / frameTimeMs);
      return Math.max(0, Math.min(durationMs, Math.round(frameIndex * frameTimeMs)));
    },
    [frameTimeMs, durationMs]
  );

  const setTakeoffMarker = useCallback(() => {
    const quantized = quantizeToFrame(currentPositionMs);
    setTakeoffFrameMs(quantized);
  }, [currentPositionMs, quantizeToFrame]);

  const setLandingMarker = useCallback(() => {
    const quantized = quantizeToFrame(currentPositionMs);
    setLandingFrameMs(quantized);
  }, [currentPositionMs, quantizeToFrame]);

  const stepFrame = useCallback(
    (deltaFrames: number) => {
      setIsPlaying(false);
      setCurrentPositionMs((prev) => {
        const nextPos = prev + deltaFrames * frameTimeMs;
        return Math.max(0, Math.min(durationMs > 0 ? durationMs : 60000, nextPos));
      });
    },
    [frameTimeMs, durationMs]
  );

  const seekTo = useCallback((positionMs: number) => {
    setCurrentPositionMs(Math.max(0, Math.min(durationMs, positionMs)));
  }, [durationMs]);

  const resetMarkers = useCallback(() => {
    setTakeoffFrameMs(null);
    setLandingFrameMs(null);
  }, []);

  const airtimeMetrics: AirtimeJumpMetrics | null = useMemo(() => {
    if (takeoffFrameMs === null || landingFrameMs === null) {
      return null;
    }
    if (landingFrameMs <= takeoffFrameMs) {
      return null;
    }
    return flightTimeEngine.evaluateAirtimeJump(takeoffFrameMs, landingFrameMs, athleteMassKg);
  }, [takeoffFrameMs, landingFrameMs, athleteMassKg]);

  return {
    videoUri,
    setVideoUri,
    durationMs,
    setDurationMs,
    currentPositionMs,
    setCurrentPositionMs,
    takeoffFrameMs,
    landingFrameMs,
    playbackSpeed,
    setPlaybackSpeed,
    isPlaying,
    setIsPlaying,
    frameTimeMs,
    airtimeMetrics,
    setTakeoffMarker,
    setLandingMarker,
    stepFrame,
    seekTo,
    resetMarkers,
  };
}
