export interface Corner {
  x: number;
  y: number;
}

export interface ArucoDetection {
  detected: true;
  markerId: number;
  markerWidthPixels: number;
  markerHeightPixels: number;
  markerCenter: Corner;
  rotationAngle: number;
  cmPerPixel: number;
  confidence: number;
  corners: [Corner, Corner, Corner, Corner]; // TL, TR, BR, BL
}

export interface ArucoMiss {
  detected: false;
  reason: ArucoErrorCode;
}

export type ArucoResult = ArucoDetection | ArucoMiss;

export type ArucoErrorCode =
  | 'MARKER_NOT_FOUND'
  | 'WRONG_MARKER_ID'
  | 'PARTIAL_MARKER'
  | 'MARKER_TOO_SMALL'
  | 'MARKER_BLURRED'
  | 'LOW_CONFIDENCE'
  | 'OPENCV_NOT_INIT'
  | 'UNKNOWN';

export const MARKER_PHYSICAL_CM = 21.0;
export const EXPECTED_MARKER_ID = 0;
export const MIN_CONFIDENCE = 30;       // percent
export const MIN_MARKER_PX = 40;        // pixels
