/** Height test configuration — marker size and video constraints. */

export const DEFAULT_MARKER_SIZE_CM = 15;
export const MIN_MARKER_SIZE_CM = 5;
export const MAX_MARKER_SIZE_CM = 30;

export const MIN_VIDEO_DURATION_SEC = 10;
export const MAX_VIDEO_DURATION_SEC = 30;

export const MIN_HEIGHT_CM = 80;
export const MAX_HEIGHT_CM = 250;

/** Confidence below this threshold prompts re-measurement. */
export const LOW_CONFIDENCE_THRESHOLD = 60;

/** Target inference frame rate for on-device processing. */
export const TARGET_INFERENCE_FPS = 15;

export const DEFAULT_CALIBRATION_METHOD = 'aruco_15cm' as const;
