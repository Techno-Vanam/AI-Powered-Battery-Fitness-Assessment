/**
 * Hook to manage ArUco / A4 calibration state and pixel-to-cm scale factor
 */

import { useState, useCallback } from 'react';
import { CalibrationResult, CalibrationMethod } from '../types/calibration';

export function useJumpCalibration() {
  const [calibrationResult, setCalibrationResult] = useState<CalibrationResult | null>(null);
  const [method, setMethod] = useState<CalibrationMethod>('aruco');

  const setCalibration = useCallback((pixelsPerCm: number, usedMethod: CalibrationMethod = 'aruco') => {
    setCalibrationResult({
      isCalibrated: true,
      method: usedMethod,
      pixelsPerCm,
      cmPerPixel: 1 / pixelsPerCm,
      confidence: 0.98,
      timestamp: Date.now(),
    });
  }, []);

  const resetCalibration = useCallback(() => {
    setCalibrationResult(null);
  }, []);

  return {
    isCalibrated: Boolean(calibrationResult?.isCalibrated),
    calibrationResult,
    pixelsPerCm: calibrationResult?.pixelsPerCm ?? 10.0, // fallback default
    method,
    setMethod,
    setCalibration,
    resetCalibration,
  };
}
