/**
 * Calibration method definitions and state
 */

export type CalibrationMethod = 'aruco' | 'a4_paper';

export interface ArUcoConfig {
  markerSizeCm: number; // 10.0 cm
  dictionaryId: string; // "DICT_4X4_50" or standard
}

export interface A4PaperConfig {
  widthCm: number; // 21.0 cm
  heightCm: number; // 29.7 cm
  orientation: 'portrait' | 'landscape';
}

export interface CalibrationResult {
  isCalibrated: boolean;
  method: CalibrationMethod;
  pixelsPerCm: number;
  cmPerPixel: number;
  confidence: number;
  timestamp: number;
  boundingPoly?: { x: number; y: number }[];
}

export interface CalibrationState {
  status: 'uncalibrated' | 'detecting' | 'calibrated' | 'error';
  result: CalibrationResult | null;
  errorMessage?: string;
}
