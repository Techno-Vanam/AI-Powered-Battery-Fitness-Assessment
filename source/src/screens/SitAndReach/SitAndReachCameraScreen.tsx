import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  PermissionsAndroid,
  Platform,
  useWindowDimensions,
  DeviceEventEmitter,
} from 'react-native';

import { Camera, useCameraDevice, VisionCamera } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';

import { loadPoseModel } from '../../services/sitReach/poseDetectionService';

import { SitReachState } from '../../services/sitReach/sitReachStateMachine';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/AppNavigator';


/* =========================================================
   TYPES
========================================================= */

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'SitAndReachCamera'
  >;


type Landmark = {
  x: number;
  y: number;
  score: number;
};

type PhysicalPoint = {
  xCm: number;
  yCm: number;
};


type CameraState =
  | 'initializing'
  | 'ready'
  | 'error';


/* =========================================================
   MOVENET LANDMARK INDEXES

   MoveNet SinglePose:

   0  nose
   1  left eye
   2  right eye
   3  left ear
   4  right ear
   5  left shoulder
   6  right shoulder
   7  left elbow
   8  right elbow
   9  left wrist
   10 right wrist
   11 left hip
   12 right hip
   13 left knee
   14 right knee
   15 left ankle
   16 right ankle
========================================================= */

const MOVENET = {

  NOSE: 0,

  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,

  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,

  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,

  LEFT_HIP: 11,
  RIGHT_HIP: 12,

  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,

  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,

};


/* =========================================================
   CONSTANTS
========================================================= */

const TRIAL_COUNT = 3;

const HOLD_REQUIRED_SECONDS = 5;

const LANDMARK_CONFIDENCE_THRESHOLD = 0.25;

/*
 * Side-view Sit & Reach is difficult for a single-pose model because the
 * far-side joints are often occluded. We therefore validate one coherent
 * visible side rather than demanding both sides.
 */
const SIDE_VIEW_CONFIDENCE_THRESHOLD = 0.20;

/*
 * ============================================================
 * PHYSICAL SIT & REACH BOX / RULER CONFIGURATION
 * ============================================================
 *
 * The four fiducial markers define the calibrated measurement plane.
 * The dimensions below MUST eventually match the physically measured
 * marker layout on the real Sit & Reach box/ruler.
 *
 * Current development plane:
 *   X = 0..30 cm
 *   Y = 0..15 cm
 */
const CALIBRATION_BOARD_WIDTH_CM = 30;
const CALIBRATION_BOARD_HEIGHT_CM = 15;

/*
 * X coordinate of the REAL Sit & Reach zero/reference line in the same
 * coordinate system as the four calibration markers.
 *
 * TEMPORARY DEVELOPMENT VALUE = 0 cm.
 * Replace this only after measuring the real box.
 */
const BOX_REFERENCE_X_CM = 0;

/*
 * Set true only after the four markers are mounted on the real box,
 * their spacing is measured, and BOX_REFERENCE_X_CM is measured.
 */
const REAL_BOX_REFERENCE_CONFIGURED = false;

const MEASUREMENT_X_TOLERANCE_CM = 1.5;
const MEASUREMENT_Y_TOLERANCE_CM = 5.0;

/*
 * Stability settings for LIVE REACH.
 * We smooth a short rolling window and require the readings to remain within
 * a small range before calling the reach stable. This is validation-only:
 * stable readings are NOT automatically saved as Trial 1/2/3 yet.
 */
const REACH_SMOOTHING_WINDOW = 7;
const REACH_STABLE_MIN_SAMPLES = 5;
const REACH_STABLE_RANGE_CM = 1.2;
const REACH_STABLE_HOLD_MS = 1500;
const TRIAL_RELEASE_REQUIRED_MS = 700;


/*
 * For a proper sit-and-reach posture, knees should be
 * approximately straight.
 */
const MIN_STRAIGHT_KNEE_ANGLE = 150;


/*
 * Arms should be reasonably extended.
 */
const MIN_EXTENDED_ARM_ANGLE = 140;


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function isVisible(
  landmark?: Landmark
): boolean {

  return !!landmark &&
    landmark.score >=
    LANDMARK_CONFIDENCE_THRESHOLD;
}


function isSideViewVisible(
  landmark?: Landmark
): boolean {
  return !!landmark &&
    landmark.score >=
    SIDE_VIEW_CONFIDENCE_THRESHOLD;
}


/*
 * Calculate angle ABC.
 *
 * B is the joint/vertex.
 *
 * Example:
 *
 * hip -> knee -> ankle
 *
 * calculateAngle(hip, knee, ankle)
 */
function calculateAngle(
  a?: Landmark,
  b?: Landmark,
  c?: Landmark
): number | null {

  if (
    !a ||
    !b ||
    !c
  ) {

    return null;
  }


  if (
    !isVisible(a) ||
    !isVisible(b) ||
    !isVisible(c)
  ) {

    return null;
  }


  const vectorBA = {

    x:
      a.x -
      b.x,

    y:
      a.y -
      b.y,

  };


  const vectorBC = {

    x:
      c.x -
      b.x,

    y:
      c.y -
      b.y,

  };


  const dot =
    vectorBA.x *
    vectorBC.x +
    vectorBA.y *
    vectorBC.y;


  const magnitudeBA =
    Math.sqrt(
      vectorBA.x *
      vectorBA.x +
      vectorBA.y *
      vectorBA.y
    );


  const magnitudeBC =
    Math.sqrt(
      vectorBC.x *
      vectorBC.x +
      vectorBC.y *
      vectorBC.y
    );


  if (
    magnitudeBA === 0 ||
    magnitudeBC === 0
  ) {

    return null;
  }


  let cosine =
    dot /
    (
      magnitudeBA *
      magnitudeBC
    );


  cosine =
    Math.max(
      -1,
      Math.min(
        1,
        cosine
      )
    );


  const radians =
    Math.acos(
      cosine
    );


  return (
    radians *
    180
  ) / Math.PI;
}


/*
 * Calculate torso lean relative to vertical.
 *
 * 0° = upright.
 * Larger value = torso leaning farther.
 */
function calculateTorsoAngle(
  shoulder?: Landmark,
  hip?: Landmark
): number | null {

  if (
    !shoulder ||
    !hip ||
    !isVisible(shoulder) ||
    !isVisible(hip)
  ) {

    return null;
  }


  const dx =
    shoulder.x -
    hip.x;


  const dy =
    shoulder.y -
    hip.y;


  const angle =
    Math.atan2(
      Math.abs(dx),
      Math.abs(dy)
    );


  return (
    angle *
    180
  ) / Math.PI;
}


/*
 * Apply the 3x3 calibration homography produced by
 * MarkerCalibrationDetector.kt.
 *
 * IMPORTANT:
 * x/y passed here must be ORIGINAL CAMERA/DETECTOR PIXELS,
 * not React Native preview coordinates.
 *
 * Result:
 *   xCm = horizontal position on the 30 cm reference board
 *   yCm = vertical position on the 15 cm reference board
 */
function imagePointToCentimeters(
  x: number,
  y: number,
  homography: number[] | null
): PhysicalPoint | null {

  if (!homography || homography.length !== 9) {
    return null;
  }

  const denominator =
    homography[6] * x +
    homography[7] * y +
    homography[8];

  if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-9) {
    return null;
  }

  const xCm =
    (
      homography[0] * x +
      homography[1] * y +
      homography[2]
    ) / denominator;

  const yCm =
    (
      homography[3] * x +
      homography[4] * y +
      homography[5]
    ) / denominator;

  if (!Number.isFinite(xCm) || !Number.isFinite(yCm)) {
    return null;
  }

  return { xCm, yCm };
}


/* =========================================================
   SCREEN
========================================================= */

export default function SitAndReachCameraScreen({
  navigation,
  route,
}: Props) {

  /* -------------------------------------------------------
     ORIENTATION GATE

     The native camera is mounted ONLY in landscape.
     This prevents CameraX from starting against a portrait
     surface and removes the old rotate-to-wake-preview issue.
  ------------------------------------------------------- */

  const {
    width: windowWidth,
    height: windowHeight,
  } = useWindowDimensions();

  const isLandscape =
    windowWidth > windowHeight;

  const isFocused = useIsFocused();
  const [cameraMountReady, setCameraMountReady] = useState(false);
  const device = useCameraDevice('back');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLandscape && isFocused) {
      console.log('[SitReach] Landscape detected. Starting layout-settle gate...');
      timer = setTimeout(() => {
        console.log('[SitReach] Layout settled. Camera mounting ready.');
        setCameraMountReady(true);
      }, 500);
    } else {
      console.log('[SitReach] Portrait or screen blurred. Unmounting camera.');
      setCameraMountReady(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isLandscape, isFocused]);

  const frameOutput = useMemo(() => {
    return VisionCamera.createFrameOutput({
      targetResolution: { width: 1280, height: 720 },
      pixelFormat: 'yuv',
      dropFramesWhileBusy: true,
      enableCameraMatrixDelivery: false,
      enablePhysicalBufferRotation: false,
      enablePreviewSizedOutputBuffers: false,
      allowDeferredStart: true,
    });
  }, []);

  useEffect(() => {
    console.log('[SitReachPose] Registering SitReachPoseDetected listener');
    const subscription = DeviceEventEmitter.addListener('SitReachPoseDetected', (event) => {
      if (!event || !event.landmarks) return;

      const incoming = event.landmarks;
      const sourceWidth = event.sourceWidth || 640;
      const sourceHeight = event.sourceHeight || 480;

      const previewScale = Math.max(windowWidth / sourceWidth, windowHeight / sourceHeight);
      const displayedWidth = sourceWidth * previewScale;
      const displayedHeight = sourceHeight * previewScale;
      const cropX = (displayedWidth - windowWidth) / 2;
      const cropY = (displayedHeight - windowHeight) / 2;

      const cleanLandmarks = incoming.map((point: any) => ({
        x: point.x * displayedWidth - cropX,
        y: point.y * displayedHeight - cropY,
        score: point.score,
      }));

      setLandmarks(cleanLandmarks);
      setBodyDetected(cleanLandmarks.filter((pt: any) => pt.score >= LANDMARK_CONFIDENCE_THRESHOLD).length >= 5);
      setPoseEventCount((prev) => prev + 1);

      const mapPoint = (point: any) => {
        if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
          return null;
        }

        return {
          x: point.x * displayedWidth - cropX,
          y: point.y * displayedHeight - cropY,
          score: Number(point.score ?? 0),
        };
      };

      /*
       * Native hand landmarks are normalized (0..1).
       * Keep the forward-most fingertip in ORIGINAL source pixels too.
       * The homography MUST use detector/image pixels, not preview pixels.
       */
      const rawForwardTip =
        event.handDetected &&
          event.forwardMostFingertip &&
          typeof event.forwardMostFingertip.x === 'number' &&
          typeof event.forwardMostFingertip.y === 'number'
          ? {
            x: event.forwardMostFingertip.x * sourceWidth,
            y: event.forwardMostFingertip.y * sourceHeight,
            score: Number(event.forwardMostFingertip.score ?? 0),
          }
          : null;

      if (event.handDetected) {
        setHandDetected(true);
        setThumbFingertip(mapPoint(event.thumbFingertip));
        setIndexFingertip(mapPoint(event.indexFingertip));
        setMiddleFingertip(mapPoint(event.middleFingertip));
        setRingFingertip(mapPoint(event.ringFingertip));
        setPinkyFingertip(mapPoint(event.pinkyFingertip));
        setForwardMostFingertip(mapPoint(event.forwardMostFingertip));
        setForwardMostFingertipRaw(rawForwardTip);

        if (Array.isArray(event.allFingertips)) {
          setAllFingertips(
            event.allFingertips
              .map(mapPoint)
              .filter(Boolean) as Landmark[]
          );
        } else {
          setAllFingertips([]);
        }
      } else {
        setHandDetected(false);
        setThumbFingertip(null);
        setIndexFingertip(null);
        setMiddleFingertip(null);
        setRingFingertip(null);
        setPinkyFingertip(null);
        setForwardMostFingertip(null);
        setForwardMostFingertipRaw(null);
        setAllFingertips([]);
      }

      if (event.calibration) {
        const calibrationIsValid = event.calibration.valid === true;

        /*
         * IMPORTANT:
         * Marker visibility and calibration lock are different things.
         *
         * Once native calibration becomes VALID and supplies a 3x3
         * homography, keep that transform locked. Later frames are allowed
         * to report no markers / invalid live calibration without erasing
         * the transform. This is required because the athlete's hand/body
         * can cover the markers during the actual Sit & Reach movement.
         *
         * The locked calibration is cleared only by the existing explicit
         * reset/orientation/camera-reset paths elsewhere in this screen.
         */
        const incomingHomography =
          calibrationIsValid &&
            Array.isArray(event.calibration.homography) &&
            event.calibration.homography.length === 9
            ? event.calibration.homography.map((value: any) => Number(value))
            : null;

        if (incomingHomography) {
          setCalibrationValid(true);
          setCalibrationHomography(incomingHomography);
          setCalibrationStability('5/5');
        } else {
          // Keep the last valid/locked calibration. Only update the live
          // stability text while calibration has not locked yet.
          setCalibrationStability(previous =>
            previous === '5/5'
              ? previous
              : (event.calibration.stability ?? previous ?? '0/5')
          );
        }

        /*
         * Marker coordinates remain LIVE. If a marker disappears, its dot
         * disappears too, even though the calibration transform stays locked.
         */
        const mapMarker = (marker: any) => {
          if (!marker || !marker.detected) return null;

          return {
            x: marker.x * displayedWidth - cropX,
            y: marker.y * displayedHeight - cropY,
            detected: true,
          };
        };

        setMarkerA(mapMarker(event.calibration.markerA));
        setMarkerB(mapMarker(event.calibration.markerB));
        setMarkerC(mapMarker(event.calibration.markerC));
        setMarkerD(mapMarker(event.calibration.markerD));
      } else {
        /*
         * No calibration payload in this frame means the markers are not
         * currently available. Clear only LIVE marker indicators.
         * Do NOT erase the previously locked homography here.
         */
        setMarkerA(null);
        setMarkerB(null);
        setMarkerC(null);
        setMarkerD(null);
      }
    });

    return () => {
      console.log('[SitReachPose] Cleaning up SitReachPoseDetected listener');
      subscription.remove();
    };
  }, [windowWidth, windowHeight]);

  /* -------------------------------------------------------
     ROUTE
  ------------------------------------------------------- */

  const athleteId =
    route.params.athleteId;

  const athleteName =
    route.params.athleteName;


  /* -------------------------------------------------------
     CAMERA PERMISSION
  ------------------------------------------------------- */

  const [
    cameraPermissionGranted,
    setCameraPermissionGranted,
  ] =
    useState(false);


  const [
    permissionChecking,
    setPermissionChecking,
  ] =
    useState(true);


  /* -------------------------------------------------------
     CAMERA
  ------------------------------------------------------- */

  const [
    cameraState,
    setCameraState,
  ] =
    useState<CameraState>(
      'initializing'
    );


  /* -------------------------------------------------------
     POSE
  ------------------------------------------------------- */

  const [
    poseStatus,
    setPoseStatus,
  ] =
    useState<
      'checking' |
      'ready' |
      'missing' |
      'error'
    >(
      'checking'
    );


  const [
    landmarks,
    setLandmarks,
  ] =
    useState<Landmark[]>(
      []
    );


  const [
    poseEventCount,
    setPoseEventCount,
  ] =
    useState(0);


  const [
    bodyDetected,
    setBodyDetected,
  ] =
    useState(false);


  const [handDetected, setHandDetected] = useState(false);
  const [indexFingertip, setIndexFingertip] = useState<Landmark | null>(null);
  const [middleFingertip, setMiddleFingertip] = useState<Landmark | null>(null);
  const [thumbFingertip, setThumbFingertip] = useState<Landmark | null>(null);
  const [ringFingertip, setRingFingertip] = useState<Landmark | null>(null);
  const [pinkyFingertip, setPinkyFingertip] = useState<Landmark | null>(null);
  const [forwardMostFingertip, setForwardMostFingertip] = useState<Landmark | null>(null);
  const [forwardMostFingertipRaw, setForwardMostFingertipRaw] = useState<Landmark | null>(null);
  const [allFingertips, setAllFingertips] = useState<Landmark[]>([]);

  const [calibrationValid, setCalibrationValid] = useState(false);
  const [calibrationHomography, setCalibrationHomography] = useState<number[] | null>(null);
  const [calibrationStability, setCalibrationStability] = useState('0/5');
  const [markerA, setMarkerA] = useState<{ x: number; y: number; detected: boolean } | null>(null);
  const [markerB, setMarkerB] = useState<{ x: number; y: number; detected: boolean } | null>(null);
  const [markerC, setMarkerC] = useState<{ x: number; y: number; detected: boolean } | null>(null);
  const [markerD, setMarkerD] = useState<{ x: number; y: number; detected: boolean } | null>(null);

  /*
   * Live calibrated fingertip coordinate.
   *
   * This uses RAW source pixels + the Kotlin homography.
   * Preview/cropped screen coordinates are deliberately not used.
   */
  const fingertipPhysicalPoint = useMemo(() => {

    if (
      !calibrationValid ||
      !forwardMostFingertipRaw ||
      !calibrationHomography
    ) {
      return null;
    }

    return imagePointToCentimeters(
      forwardMostFingertipRaw.x,
      forwardMostFingertipRaw.y,
      calibrationHomography
    );

  }, [
    calibrationValid,
    forwardMostFingertipRaw,
    calibrationHomography,
  ]);

  /*
   * Only accept transformed fingertip coordinates that are on, or very
   * slightly outside, the calibrated 30 x 15 cm measurement surface.
   * The tolerance avoids rejecting points because of tiny detector noise.
   */
  const fingertipInsideMeasurementPlane = useMemo(() => {
    if (!fingertipPhysicalPoint) {
      return false;
    }

    const xValid =
      fingertipPhysicalPoint.xCm >= -MEASUREMENT_X_TOLERANCE_CM &&
      fingertipPhysicalPoint.xCm <=
      CALIBRATION_BOARD_WIDTH_CM + MEASUREMENT_X_TOLERANCE_CM;

    const yReasonablyClose =
      fingertipPhysicalPoint.yCm >= -MEASUREMENT_Y_TOLERANCE_CM &&
      fingertipPhysicalPoint.yCm <=
      CALIBRATION_BOARD_HEIGHT_CM + MEASUREMENT_Y_TOLERANCE_CM;

    return xValid && yReasonablyClose;
  }, [fingertipPhysicalPoint]);

  /*
   * Temporary LIVE REACH.
   *
   * Positive values mean the fingertip has moved in the +X direction
   * from the configured zero/reference line.
   *
   * We are NOT recording trials from this value yet. First validate it
   * physically at known ruler positions (5, 10, 15, 20, 25 cm).
   */
  const liveReachCm = useMemo(() => {
    if (!fingertipPhysicalPoint || !fingertipInsideMeasurementPlane) {
      return null;
    }

    /*
     * FINAL PHYSICAL MEASUREMENT FORMULA:
     *
     * fingertip position on calibrated ruler plane
     *   MINUS
     * measured physical box zero/reference position.
     *
     * Until the real box reference is configured, this value is useful for
     * calibration testing only and must not be treated as an official score.
     */
    return fingertipPhysicalPoint.xCm - BOX_REFERENCE_X_CM;
  }, [fingertipPhysicalPoint, fingertipInsideMeasurementPlane]);

  /*
   * LIVE REACH STABILITY
   *
   * Keep the raw live value for diagnostics, but expose a smoothed value for
   * the athlete-facing measurement. A reach becomes STABLE only when several
   * consecutive readings stay inside REACH_STABLE_RANGE_CM for
   * REACH_STABLE_HOLD_MS.
   */
  const reachSamplesRef = useRef<number[]>([]);
  const reachStableSinceRef = useRef<number | null>(null);

  const [smoothedReachCm, setSmoothedReachCm] = useState<number | null>(null);
  const [reachStable, setReachStable] = useState(false);
  const [reachStabilityProgress, setReachStabilityProgress] = useState(0);

  useEffect(() => {
    if (liveReachCm === null || !Number.isFinite(liveReachCm)) {
      reachSamplesRef.current = [];
      reachStableSinceRef.current = null;
      setSmoothedReachCm(null);
      setReachStable(false);
      setReachStabilityProgress(0);
      return;
    }

    const samples = [...reachSamplesRef.current, liveReachCm].slice(
      -REACH_SMOOTHING_WINDOW
    );
    reachSamplesRef.current = samples;

    // Median is robust against a single bad fingertip frame.
    const sorted = [...samples].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];

    setSmoothedReachCm(median);

    if (samples.length < REACH_STABLE_MIN_SAMPLES) {
      reachStableSinceRef.current = null;
      setReachStable(false);
      setReachStabilityProgress(
        Math.round((samples.length / REACH_STABLE_MIN_SAMPLES) * 100)
      );
      return;
    }

    const range = Math.max(...samples) - Math.min(...samples);

    if (range > REACH_STABLE_RANGE_CM) {
      reachStableSinceRef.current = null;
      setReachStable(false);
      setReachStabilityProgress(0);
      return;
    }

    const now = Date.now();

    if (reachStableSinceRef.current === null) {
      reachStableSinceRef.current = now;
      setReachStable(false);
      setReachStabilityProgress(1);
      return;
    }

    const stableFor = now - reachStableSinceRef.current;
    const progress = Math.min(
      100,
      Math.round((stableFor / REACH_STABLE_HOLD_MS) * 100)
    );

    setReachStabilityProgress(progress);

    if (stableFor >= REACH_STABLE_HOLD_MS) {
      setReachStable(true);
      setReachStabilityProgress(100);
    } else {
      setReachStable(false);
    }
  }, [liveReachCm]);


  /* -------------------------------------------------------
     TRIALS
  ------------------------------------------------------- */

  const [
    trialResults,
    setTrialResults,
  ] =
    useState<number[]>(
      []
    );


  const [
    holdTimer,
    setHoldTimer,
  ] =
    useState(
      HOLD_REQUIRED_SECONDS
    );


  const holdStartTimeRef =
    useRef<number | null>(
      null
    );


  /*
   * THREE-TRIAL CAPTURE CONTROL
   *
   * A stable hold records only ONE trial. After a capture, the athlete must
   * release/remove the hand from the measurement region briefly before the
   * next trial can be started. This prevents one continuous hold from filling
   * Trial 1, Trial 2 and Trial 3.
   */
  const trialCaptureArmedRef = useRef(false);
  const releaseStartedAtRef = useRef<number | null>(null);

  const [
    waitingForRelease,
    setWaitingForRelease,
  ] = useState(false);


  const bestScore = useMemo(() => {
    if (trialResults.length === 0) {
      return null;
    }

    return Math.max(...trialResults);
  }, [trialResults]);


  /* -------------------------------------------------------
     STATE MACHINE
  ------------------------------------------------------- */

  const [
    currentState,
    setCurrentState,
  ] =
    useState<SitReachState>(
      'PERMISSION'
    );


  const [
    statusMessage,
    setStatusMessage,
  ] =
    useState(
      'Checking camera permission...'
    );


  const [
    errorText,
    setErrorText,
  ] =
    useState<string | null>(
      null
    );


  /*
   * AUTO-CAPTURE A TRIAL.
   * One stable hold can save only one trial.
   */
  useEffect(() => {
    if (
      currentState !== 'TRIAL_ACTIVE' ||
      !trialCaptureArmedRef.current ||
      !reachStable ||
      smoothedReachCm === null ||
      !fingertipInsideMeasurementPlane ||
      !calibrationValid ||
      !calibrationHomography
    ) {
      return;
    }

    const capturedValue = Number(smoothedReachCm.toFixed(1));

    trialCaptureArmedRef.current = false;

    setTrialResults(previous => {
      if (previous.length >= TRIAL_COUNT) {
        return previous;
      }

      return [...previous, capturedValue];
    });

    setWaitingForRelease(true);
    releaseStartedAtRef.current = null;
    setCurrentState('READY');

    setStatusMessage(
      `Trial captured: ${capturedValue.toFixed(1)} cm. Release your hand before the next trial.`
    );
  }, [
    currentState,
    reachStable,
    smoothedReachCm,
    fingertipInsideMeasurementPlane,
    calibrationValid,
    calibrationHomography,
  ]);


  /*
   * Require the athlete to remove/retract the hand after each capture.
   * This prevents one continuous stable hold from recording multiple trials.
   */
  useEffect(() => {
    if (!waitingForRelease) {
      releaseStartedAtRef.current = null;
      return;
    }

    const handReleased =
      !handDetected ||
      !forwardMostFingertipRaw ||
      !fingertipInsideMeasurementPlane;

    if (!handReleased) {
      releaseStartedAtRef.current = null;
      return;
    }

    releaseStartedAtRef.current = Date.now();

    const timer = setTimeout(() => {
      setWaitingForRelease(false);
      releaseStartedAtRef.current = null;

      setStatusMessage(
        trialResults.length >= TRIAL_COUNT
          ? 'All 3 trials complete.'
          : `Ready for Trial ${trialResults.length + 1}.`
      );
    }, TRIAL_RELEASE_REQUIRED_MS);

    return () => clearTimeout(timer);
  }, [
    waitingForRelease,
    handDetected,
    forwardMostFingertipRaw,
    fingertipInsideMeasurementPlane,
    trialResults.length,
  ]);


  /* =========================================================
     LANDMARKS
  ========================================================= */

  const visibleLandmarkCount =
    useMemo(() => {

      return landmarks.filter(
        landmark =>
          landmark.score >=
          LANDMARK_CONFIDENCE_THRESHOLD
      ).length;

    }, [
      landmarks,
    ]);


  /* =========================================================
     LEFT KNEE ANGLE
  ========================================================= */

  const leftKneeAngle =
    useMemo(() => {

      return calculateAngle(

        landmarks[
        MOVENET.LEFT_HIP
        ],

        landmarks[
        MOVENET.LEFT_KNEE
        ],

        landmarks[
        MOVENET.LEFT_ANKLE
        ]
      );

    }, [
      landmarks,
    ]);


  /* =========================================================
     RIGHT KNEE ANGLE
  ========================================================= */

  const rightKneeAngle =
    useMemo(() => {

      return calculateAngle(

        landmarks[
        MOVENET.RIGHT_HIP
        ],

        landmarks[
        MOVENET.RIGHT_KNEE
        ],

        landmarks[
        MOVENET.RIGHT_ANKLE
        ]
      );

    }, [
      landmarks,
    ]);


  /* =========================================================
     LEFT ARM ANGLE
  ========================================================= */

  const leftArmAngle =
    useMemo(() => {

      return calculateAngle(

        landmarks[
        MOVENET.LEFT_SHOULDER
        ],

        landmarks[
        MOVENET.LEFT_ELBOW
        ],

        landmarks[
        MOVENET.LEFT_WRIST
        ]
      );

    }, [
      landmarks,
    ]);


  /* =========================================================
     RIGHT ARM ANGLE
  ========================================================= */

  const rightArmAngle =
    useMemo(() => {

      return calculateAngle(

        landmarks[
        MOVENET.RIGHT_SHOULDER
        ],

        landmarks[
        MOVENET.RIGHT_ELBOW
        ],

        landmarks[
        MOVENET.RIGHT_WRIST
        ]
      );

    }, [
      landmarks,
    ]);


  /* =========================================================
     TORSO ANGLE
  ========================================================= */

  const leftTorsoAngle =
    useMemo(() => {

      return calculateTorsoAngle(

        landmarks[
        MOVENET.LEFT_SHOULDER
        ],

        landmarks[
        MOVENET.LEFT_HIP
        ]
      );

    }, [
      landmarks,
    ]);


  const rightTorsoAngle =
    useMemo(() => {

      return calculateTorsoAngle(

        landmarks[
        MOVENET.RIGHT_SHOULDER
        ],

        landmarks[
        MOVENET.RIGHT_HIP
        ]
      );

    }, [
      landmarks,
    ]);


  const torsoAngle =
    useMemo(() => {

      const available =
        [
          leftTorsoAngle,
          rightTorsoAngle,
        ].filter(
          (
            value
          ): value is number =>
            value !== null
        );


      if (
        available.length === 0
      ) {

        return null;
      }


      return (
        available.reduce(
          (
            sum,
            value
          ) =>
            sum +
            value,
          0
        ) /
        available.length
      );

    }, [
      leftTorsoAngle,
      rightTorsoAngle,
    ]);


  /* =========================================================
     POSTURE CHECKS
  ========================================================= */

  const leftKneeStraight =

    leftKneeAngle !== null &&

    leftKneeAngle >=
    MIN_STRAIGHT_KNEE_ANGLE;


  const rightKneeStraight =

    rightKneeAngle !== null &&

    rightKneeAngle >=
    MIN_STRAIGHT_KNEE_ANGLE;


  /*
   * At least one leg must be confidently visible and straight.
   *
   * In side profile one side may naturally have lower
   * confidence than the other.
   */
  const kneesStraight =

    leftKneeStraight ||

    rightKneeStraight;


  const leftArmExtended =

    leftArmAngle !== null &&

    leftArmAngle >=
    MIN_EXTENDED_ARM_ANGLE;


  const rightArmExtended =

    rightArmAngle !== null &&

    rightArmAngle >=
    MIN_EXTENDED_ARM_ANGLE;


  const armsExtended =

    leftArmExtended ||

    rightArmExtended;


  /*
   * Critical body landmarks required for sit-and-reach.
   *
   * We intentionally allow either left OR right side because
   * this assessment is performed from side profile.
   */
  const leftSideVisible =

    isSideViewVisible(
      landmarks[MOVENET.LEFT_SHOULDER]
    ) &&

    isSideViewVisible(
      landmarks[MOVENET.LEFT_ELBOW]
    ) &&

    isSideViewVisible(
      landmarks[MOVENET.LEFT_HIP]
    ) &&

    isSideViewVisible(
      landmarks[MOVENET.LEFT_KNEE]
    ) &&

    isSideViewVisible(
      landmarks[MOVENET.LEFT_ANKLE]
    );


  const rightSideVisible =

    isSideViewVisible(
      landmarks[MOVENET.RIGHT_SHOULDER]
    ) &&

    isSideViewVisible(
      landmarks[MOVENET.RIGHT_ELBOW]
    ) &&

    isSideViewVisible(
      landmarks[MOVENET.RIGHT_HIP]
    ) &&

    isSideViewVisible(
      landmarks[MOVENET.RIGHT_KNEE]
    ) &&

    isSideViewVisible(
      landmarks[MOVENET.RIGHT_ANKLE]
    );


  const requiredBodyVisible =

    leftSideVisible ||

    rightSideVisible;


  const postureValid =

    bodyDetected &&

    requiredBodyVisible &&

    kneesStraight &&

    armsExtended;


  /* =========================================================
     CAMERA PERMISSION
  ========================================================= */

  const requestCameraAccess =
    useCallback(
      async () => {

        try {

          setPermissionChecking(
            true
          );

          setErrorText(
            null
          );


          if (
            Platform.OS ===
            'android'
          ) {

            const alreadyGranted =
              await PermissionsAndroid.check(
                PermissionsAndroid
                  .PERMISSIONS
                  .CAMERA
              );


            if (
              alreadyGranted
            ) {

              setCameraPermissionGranted(
                true
              );

              setCurrentState(
                'CAMERA_INITIALIZING'
              );

              return true;
            }


            const result =
              await PermissionsAndroid.request(

                PermissionsAndroid
                  .PERMISSIONS
                  .CAMERA,

                {
                  title:
                    'Camera Permission',

                  message:
                    'Camera access is required to perform the Sit & Reach assessment.',

                  buttonPositive:
                    'Allow',

                  buttonNegative:
                    'Cancel',
                }
              );


            if (
              result ===
              PermissionsAndroid
                .RESULTS
                .GRANTED
            ) {

              setCameraPermissionGranted(
                true
              );

              setCurrentState(
                'CAMERA_INITIALIZING'
              );

              return true;
            }


            setCameraPermissionGranted(
              false
            );

            setCurrentState(
              'PERMISSION'
            );

            return false;
          }


          /*
           * Non-Android fallback
           */
          setCameraPermissionGranted(true);
          setCurrentState('CAMERA_INITIALIZING');
          return true;

        } catch (
        error
        ) {

          console.error(
            '[SitReach] Permission error:',
            error
          );


          setCameraPermissionGranted(
            false
          );

          setCurrentState(
            'PERMISSION'
          );

          setErrorText(
            'Unable to access the camera.'
          );


          return false;

        } finally {

          setPermissionChecking(
            false
          );
        }

      },
      []
    );


  /* =========================================================
     INITIAL PERMISSION CHECK
  ========================================================= */

  useEffect(() => {

    requestCameraAccess();

  }, [
    requestCameraAccess,
  ]);


  /* =========================================================
     MODEL CHECK
  ========================================================= */

  useEffect(() => {

    let mounted =
      true;


    const initializePoseModel =
      async () => {

        try {

          const result =
            await loadPoseModel();


          if (
            !mounted
          ) {

            return;
          }


          console.log(
            '[SitReach] Pose model status:',
            result
          );


          setPoseStatus(
            result
          );


          if (
            result ===
            'missing'
          ) {

            setErrorText(
              'MoveNet pose model was not found.'
            );
          }


          if (
            result ===
            'error'
          ) {

            setErrorText(
              'MoveNet pose model failed to load.'
            );
          }

        } catch (
        error
        ) {

          console.error(
            '[SitReach] Pose model error:',
            error
          );


          if (
            mounted
          ) {

            setPoseStatus(
              'error'
            );

            setErrorText(
              'Pose detection initialization failed.'
            );
          }
        }
      };


    initializePoseModel();


    return () => {

      mounted =
        false;

    };

  }, []);


  /* =========================================================
     CAMERA CALLBACK
  ========================================================= */

  const handleCameraState =
    useCallback(
      (
        event: {
          nativeEvent: {
            state: string;
            message?: string;
          };
        }
      ) => {

        const {
          state,
          message,
        } =
          event.nativeEvent;


        console.log(
          '[SitReach] Camera:',
          state,
          message
        );


        if (
          state ===
          'cameraReady'
        ) {

          setCameraState(
            'ready'
          );

          setErrorText(
            null
          );

          setCurrentState(
            'SETUP_VALIDATION'
          );

          return;
        }


        if (
          state ===
          'poseModelReady'
        ) {

          setPoseStatus(
            'ready'
          );

          return;
        }


        if (
          state ===
          'poseModelError'
        ) {

          setPoseStatus(
            'error'
          );

          setErrorText(
            message ??
            'Pose model failed.'
          );

          return;
        }


        if (
          state ===
          'cameraError'
        ) {

          setCameraState(
            'error'
          );

          setErrorText(
            message ??
            'Camera failed to start.'
          );

          setCurrentState(
            'ERROR'
          );
        }

      },
      []
    );


  /* =========================================================
     POSE CALLBACK
  ========================================================= */

  const handlePose =
    useCallback(
      (
        event: {
          nativeEvent: {
            landmarks?: Landmark[];
            detected?: boolean;
            visibleCount?: number;
          };
        }
      ) => {

        const incoming =
          event
            ?.nativeEvent
            ?.landmarks;


        if (
          !incoming ||
          !Array.isArray(
            incoming
          )
        ) {

          return;
        }


        const cleanLandmarks:
          Landmark[] =
          incoming.map(
            point => ({

              x:
                Number(
                  point.x
                ),

              y:
                Number(
                  point.y
                ),

              score:
                Number(
                  point.score
                ),

            })
          );


        setLandmarks(
          cleanLandmarks
        );


        setBodyDetected(
          event.nativeEvent
            .detected === true
        );


        setPoseEventCount(
          previous =>
            previous +
            1
        );

      },
      []
    );


  /* =========================================================
     STATUS MESSAGE
  ========================================================= */

  useEffect(() => {

    if (!cameraOperational) {

      setStatusMessage(
        'Starting camera...'
      );

      return;
    }


    if (
      !bodyDetected
    ) {

      setStatusMessage(
        'No body detected. Move into camera view.'
      );

      return;
    }


    if (
      !requiredBodyVisible
    ) {

      setStatusMessage(
        'Show your full side profile including feet and hands.'
      );

      return;
    }


    if (
      !kneesStraight
    ) {

      setStatusMessage(
        'Straighten your knees.'
      );

      return;
    }


    if (
      !armsExtended
    ) {

      setStatusMessage(
        'Extend your reaching arm.'
      );

      return;
    }


    if (
      !calibrationValid ||
      !calibrationHomography
    ) {

      setStatusMessage(
        'Show all 4 reference markers until calibration reaches 5/5 and locks.'
      );

      return;
    }


    if (
      !handDetected ||
      !forwardMostFingertipRaw
    ) {

      setStatusMessage(
        'Calibration ready. Place your reaching hand over the measurement surface.'
      );

      return;
    }


    if (
      !fingertipInsideMeasurementPlane
    ) {

      setStatusMessage(
        'Fingertip detected, but it is outside the calibrated measurement surface.'
      );

      return;
    }


    if (
      currentState ===
      'TRIAL_ACTIVE'
    ) {

      setStatusMessage(
        'Reach forward slowly.'
      );

      return;
    }


    if (
      currentState ===
      'TRIAL_HOLDING'
    ) {

      setStatusMessage(
        `Hold your reach: ${holdTimer}s`
      );

      return;
    }


    setStatusMessage(
      `Posture ready for Trial ${trialResults.length + 1
      }.`
    );

  }, [
    cameraState,
    cameraOperational,
    bodyDetected,
    requiredBodyVisible,
    kneesStraight,
    armsExtended,
    calibrationValid,
    calibrationHomography,
    handDetected,
    forwardMostFingertipRaw,
    fingertipInsideMeasurementPlane,
    currentState,
    holdTimer,
    trialResults.length,
  ]);


  /* =========================================================
     FINAL SETUP VALIDATION
  ========================================================= */

  /*
   * VisionCamera can be operational even if the legacy cameraState callback
   * remains "initializing". Native detector activity is reliable evidence
   * that frames are flowing.
   */
  const cameraOperational =
    cameraState === 'ready' ||
    poseEventCount > 0 ||
    handDetected ||
    calibrationValid;

  /*
   * The current screen receives live MoveNet results through
   * SitReachPoseDetected. Do not depend on the older poseStatus flag alone,
   * because that flag can remain "checking" even while real pose events arrive.
   */
  const poseOperational =
    poseEventCount > 0 ||
    bodyDetected ||
    landmarks.length > 0;

  /*
   * START TRIAL becomes available only after the real measurement setup is
   * usable. Hand presence is intentionally not required here: the athlete can
   * press START TRIAL and then reach forward into the measurement area.
   */
  const isSetupValid =
    cameraOperational &&
    poseOperational &&
    calibrationValid &&
    calibrationHomography !== null &&
    bodyDetected &&
    requiredBodyVisible &&
    kneesStraight &&
    armsExtended;

  /*
   * One clear athlete-facing reason for a blocked trial.
   */
  const setupBlockReason = useMemo(() => {
    if (!cameraOperational) {
      return 'Starting camera…';
    }

    if (!poseOperational) {
      return 'Move into view so body detection can start';
    }

    if (!calibrationValid || calibrationHomography === null) {
      return 'Show all 4 ruler markers until calibration locks';
    }

    if (!bodyDetected) {
      return 'Move your full body into the side view';
    }

    if (!requiredBodyVisible) {
      return 'Keep shoulder, elbow, hip, knee and ankle visible';
    }

    if (!kneesStraight) {
      return 'Straighten your knees';
    }

    if (!armsExtended) {
      return 'Extend your reaching arm';
    }

    return null;
  }, [
    cameraOperational,
    poseOperational,
    calibrationValid,
    calibrationHomography,
    bodyDetected,
    requiredBodyVisible,
    kneesStraight,
    armsExtended,
  ]);


  /* =========================================================
     START TRIAL
  ========================================================= */

  const startTrial =
    useCallback(() => {

      console.log('====================================');
      console.log('[SitReach] START TRIAL PRESSED');
      console.log('[SitReach] Trial:', trialResults.length + 1);
      console.log('[SitReach] cameraOperational:', cameraOperational);
      console.log('[SitReach] poseOperational:', poseOperational);
      console.log('[SitReach] bodyDetected:', bodyDetected);
      console.log('[SitReach] requiredBodyVisible:', requiredBodyVisible);
      console.log('[SitReach] kneesStraight:', kneesStraight);
      console.log('[SitReach] armsExtended:', armsExtended);
      console.log('[SitReach] calibrationValid:', calibrationValid);
      console.log(
        '[SitReach] homography:',
        calibrationHomography !== null
      );
      console.log('[SitReach] isSetupValid:', isSetupValid);
      console.log('====================================');

      if (trialResults.length >= TRIAL_COUNT) {
        setStatusMessage('All 3 trials are already complete.');
        return;
      }

      if (waitingForRelease) {
        setStatusMessage(
          'Remove your hand from the ruler before starting the next trial.'
        );
        return;
      }

      if (!isSetupValid) {
        setStatusMessage(
          setupBlockReason ??
          'Complete the setup before starting.'
        );
        return;
      }

      /*
       * Every trial gets a fresh stability window. This prevents a stable
       * reading from the previous trial being immediately reused.
       */
      reachSamplesRef.current = [];
      reachStableSinceRef.current = null;
      setSmoothedReachCm(null);
      setReachStable(false);
      setReachStabilityProgress(0);

      holdStartTimeRef.current = null;
      setHoldTimer(HOLD_REQUIRED_SECONDS);

      /*
       * Arm exactly one capture. The existing auto-capture effect records the
       * stable reach, then requires a hand release before the next trial.
       */
      trialCaptureArmedRef.current = true;
      setCurrentState('TRIAL_ACTIVE');

      setStatusMessage(
        `Trial ${trialResults.length + 1}: Reach forward and hold your fingertips still.`
      );

    }, [
      trialResults.length,
      waitingForRelease,
      isSetupValid,
      setupBlockReason,
      cameraOperational,
      poseOperational,
      bodyDetected,
      requiredBodyVisible,
      kneesStraight,
      armsExtended,
      calibrationValid,
      calibrationHomography,
    ]);

  /* =========================================================
     OPEN SETTINGS
  ========================================================= */

  const openSettings =
    useCallback(
      async () => {

        try {

          await Linking.openSettings();

        } catch (
        error
        ) {

          console.error(
            '[SitReach] Could not open settings:',
            error
          );
        }

      },
      []
    );


  /* =========================================================
     ORIENTATION LIFECYCLE
  ========================================================= */

  useEffect(() => {

    /*
     * When portrait is entered, NativeCameraView is removed
     * from the React tree by the render gate below. Its native
     * onDropViewInstance() releases CameraX and TFLite.
     *
     * Reset JS diagnostics so a fresh landscape mount starts
     * from a clean state.
     */
    if (!isLandscape) {

      setCameraState('initializing');
      setLandmarks([]);
      setBodyDetected(false);
      setPoseEventCount(0);
      setHandDetected(false);
      setIndexFingertip(null);
      setMiddleFingertip(null);
      setThumbFingertip(null);
      setRingFingertip(null);
      setPinkyFingertip(null);
      setForwardMostFingertip(null);
      setForwardMostFingertipRaw(null);
      setAllFingertips([]);
      setCalibrationValid(false);
      setCalibrationStability('0/5');
      setCalibrationHomography(null);
      setMarkerA(null);
      setMarkerB(null);
      setMarkerC(null);
      setMarkerD(null);

      if (cameraPermissionGranted) {
        setCurrentState('CAMERA_INITIALIZING');
        setStatusMessage('Rotate your phone horizontally to start the camera.');
      }
    }

  }, [
    isLandscape,
    cameraPermissionGranted,
  ]);


  /* =========================================================
     PERMISSION SCREEN
  ========================================================= */

  if (
    permissionChecking
  ) {

    return (

      <View
        style={
          styles.centered
        }
      >

        <ActivityIndicator
          size="large"
          color="#ffffff"
        />

        <Text
          style={
            styles.info
          }
        >

          Checking camera permission...

        </Text>

      </View>
    );
  }


  if (
    !cameraPermissionGranted
  ) {

    return (

      <View
        style={
          styles.centered
        }
      >

        <Text
          style={
            styles.permissionTitle
          }
        >

          Camera Permission Required

        </Text>


        <Text
          style={
            styles.info
          }
        >

          Camera access is required for
          automatic Sit & Reach posture
          detection.

        </Text>


        <TouchableOpacity

          style={
            styles.primaryButton
          }

          onPress={
            requestCameraAccess
          }
        >

          <Text
            style={
              styles.buttonText
            }
          >

            Grant Camera Permission

          </Text>

        </TouchableOpacity>


        <TouchableOpacity

          style={
            styles.secondaryButton
          }

          onPress={
            openSettings
          }
        >

          <Text
            style={
              styles.buttonText
            }
          >

            Open App Settings

          </Text>

        </TouchableOpacity>


        <TouchableOpacity

          style={
            styles.backButton
          }

          onPress={() =>
            navigation.goBack()
          }
        >

          <Text
            style={
              styles.buttonText
            }
          >

            Back

          </Text>

        </TouchableOpacity>

      </View>
    );
  }


  /* =========================================================
     LANDSCAPE REQUIRED

     IMPORTANT:
     NativeCameraView is intentionally NOT rendered here.
     CameraX therefore cannot start until the phone is
     physically horizontal.
  ========================================================= */

  if (!isLandscape) {

    return (

      <View style={styles.rotateContainer}>

        <View style={styles.phonePortraitIcon}>
          <View style={styles.phoneSpeaker} />
          <Text style={styles.rotateArrow}>↻</Text>
        </View>

        <Text style={styles.rotateTitle}>
          Rotate Your Phone
        </Text>

        <Text style={styles.rotateText}>
          Keep the phone horizontally for the Sit & Reach assessment.
          The camera will open automatically after landscape orientation is detected.
        </Text>

        <Text style={styles.rotateHint}>
          Do not start the test in portrait mode.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

      </View>
    );
  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (
    currentState ===
    'ERROR'
  ) {

    return (

      <View
        style={
          styles.centered
        }
      >

        <Text
          style={
            styles.errorTitle
          }
        >

          Camera Error

        </Text>


        <Text
          style={
            styles.info
          }
        >

          {errorText ??
            'Unable to start camera.'}

        </Text>


        <TouchableOpacity

          style={
            styles.backButton
          }

          onPress={() =>
            navigation.goBack()
          }
        >

          <Text
            style={
              styles.buttonText
            }
          >

            Back

          </Text>

        </TouchableOpacity>

      </View>
    );
  }


  /* =========================================================
     CAMERA UI
  ========================================================= */

  return (

    <View
      style={
        styles.container
      }
    >


      {device != null && cameraMountReady && isFocused ? (
        <Camera
          style={
            styles.cameraFeed
          }
          device={device}
          isActive={isFocused && isLandscape}
          photo={false}
          video={false}
          audio={false}
          outputs={[frameOutput]}
          onInitialized={() => {
            console.log('[SitReach] VisionCamera initialized successfully');
            setCameraState('ready');
            setErrorText(null);
            setCurrentState('SETUP_VALIDATION');
          }}
          onError={(error) => {
            console.error('[SitReach] VisionCamera error:', error);
            setCameraState('error');
            setErrorText(error.message ?? 'Camera failed to start.');
            setCurrentState('ERROR');
          }}
        />
      ) : (
        <View style={[styles.cameraFeed, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }]}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Initializing camera preview...</Text>
        </View>
      )}


      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={
          styles.overlayTop
        }
        pointerEvents="none"
      >

        <Text
          style={
            styles.title
          }
        >

          Sit & Reach Assessment

        </Text>


        <Text
          style={
            styles.subtitle
          }
        >

          {athleteName}

        </Text>

      </View>


      {/* =====================================================
          CLEAN ASSESSMENT STATUS
      ===================================================== */}

      <View style={styles.cleanStatusCard} pointerEvents="none">
        <Text style={styles.cleanCardTitle}>ASSESSMENT STATUS</Text>

        <View style={styles.cleanStatusRow}>
          <Text style={styles.cleanStatusLabel}>Calibration</Text>
          <Text style={[
            styles.cleanStatusValue,
            calibrationValid ? styles.goodText : styles.badText,
          ]}>
            {calibrationValid ? '✓ LOCKED' : '✕ REQUIRED'}
          </Text>
        </View>

        <View style={styles.cleanStatusRow}>
          <Text style={styles.cleanStatusLabel}>Posture</Text>
          <Text style={[
            styles.cleanStatusValue,
            postureValid ? styles.goodText : styles.badText,
          ]}>
            {postureValid ? '✓ READY' : '✕ ADJUST'}
          </Text>
        </View>

        <View style={styles.cleanStatusRow}>
          <Text style={styles.cleanStatusLabel}>Hand</Text>
          <Text style={[
            styles.cleanStatusValue,
            handDetected ? styles.goodText : styles.mutedText,
          ]}>
            {handDetected ? '✓ DETECTED' : 'WAITING'}
          </Text>
        </View>

        {!isSetupValid && setupBlockReason ? (
          <Text style={styles.setupReason}>{setupBlockReason}</Text>
        ) : (
          <Text style={styles.setupReady}>
            {currentState === 'TRIAL_ACTIVE'
              ? `Trial ${trialResults.length + 1} in progress`
              : waitingForRelease
                ? 'Release hand for next trial'
                : trialResults.length >= TRIAL_COUNT
                  ? 'Assessment complete'
                  : `Ready for Trial ${trialResults.length + 1}`}
          </Text>
        )}
      </View>

      {/* =====================================================
          CENTER LIVE REACH
      ===================================================== */}

      <View style={styles.cleanLiveReachCard} pointerEvents="none">
        <Text style={styles.cleanLiveReachLabel}>LIVE REACH</Text>
        <Text style={[
          styles.cleanLiveReachValue,
          smoothedReachCm !== null ? styles.goodText : styles.mutedText,
        ]}>
          {smoothedReachCm !== null ? `${smoothedReachCm.toFixed(1)} cm` : '-- cm'}
        </Text>

        <Text style={[
          styles.cleanHoldText,
          reachStable ? styles.goodText : styles.warningText,
        ]}>
          {smoothedReachCm === null
            ? 'Waiting for fingertip'
            : reachStable
              ? '✓ STABLE — HOLD CONFIRMED'
              : `HOLD STILL  ${reachStabilityProgress}%`}
        </Text>

        {smoothedReachCm !== null && !fingertipInsideMeasurementPlane && (
          <Text style={styles.badText}>Move hand over ruler area</Text>
        )}
      </View>


      {/* =====================================================
          LANDMARK DOTS
      ===================================================== */}

      {landmarks.map(
        (
          landmark,
          index
        ) => {

          if (
            landmark.score <
            LANDMARK_CONFIDENCE_THRESHOLD
          ) {

            return null;
          }


          return (

            <View

              key={
                `landmark-${index}`
              }

              pointerEvents="none"

              style={[
                styles.landmarkDot,

                {
                  left:
                    landmark.x -
                    4,

                  top:
                    landmark.y -
                    4,
                },

              ]}

            />
          );
        }
      )}

      {/* =====================================================
          HAND LANDMARK FINGERTIPS
      ===================================================== */}
      {handDetected &&
        allFingertips.map((tip, index) => {
          if (!tip) return null;
          return (
            <View
              key={`hand-tip-${index}`}
              pointerEvents="none"
              style={[
                styles.fingertipDot,
                {
                  left: tip.x - 3,
                  top: tip.y - 3,
                },
              ]}
            />
          );
        })}

      {handDetected && forwardMostFingertip && (
        <View
          pointerEvents="none"
          style={[
            styles.forwardMostFingertipDot,
            {
              left: forwardMostFingertip.x - 6,
              top: forwardMostFingertip.y - 6,
            },
          ]}
        />
      )}

      {/* Calibration/angle raw diagnostics intentionally hidden from
          the athlete-facing screen. The locked calibration and posture
          states are summarized above. */}


      {/* =====================================================
          TRIALS
      ===================================================== */}

      <View
        style={
          styles.trialResults
        }
        pointerEvents="none"
      >

        {[0, 1, 2].map(
          index => (

            <View

              key={
                index
              }

              style={
                styles.trialResultBox
              }
            >

              <Text
                style={
                  styles.trialResultLabel
                }
              >

                Trial {index + 1}

              </Text>


              <Text
                style={
                  styles.trialResultValue
                }
              >

                {trialResults[index] !==
                  undefined

                  ? `${trialResults[
                    index
                  ].toFixed(1)} cm`

                  : '--'}

              </Text>

            </View>
          )
        )}

      </View>

      {trialResults.length === TRIAL_COUNT && bestScore !== null && (
        <View style={styles.bestScoreBox} pointerEvents="none">
          <Text style={styles.bestScoreLabel}>BEST SCORE</Text>
          <Text style={styles.bestScoreValue}>{bestScore.toFixed(1)} cm</Text>
        </View>
      )}


      {/* =====================================================
          TRIAL START GUIDANCE
      ===================================================== */}

      {trialResults.length < TRIAL_COUNT && (
        <View style={styles.trialGuidance} pointerEvents="none">
          <Text
            style={[
              styles.trialGuidanceText,
              isSetupValid && !waitingForRelease
                ? styles.goodText
                : styles.warningText,
            ]}
          >
            {waitingForRelease
              ? 'Remove/retract your hand, then start the next trial.'
              : isSetupValid
                ? `Ready — press START TRIAL ${trialResults.length + 1}`
                : `Cannot start yet — ${setupBlockReason ?? 'complete setup'}`}
          </Text>
        </View>
      )}


      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <View
        style={
          styles.controls
        }
      >

        <TouchableOpacity

          style={
            styles.backControl
          }

          onPress={() =>
            navigation.goBack()
          }
        >

          <Text
            style={
              styles.buttonText
            }
          >

            Back

          </Text>

        </TouchableOpacity>


        <TouchableOpacity

          style={[
            styles.startTrialButton,

            (!isSetupValid ||
              waitingForRelease ||
              trialResults.length >= TRIAL_COUNT) &&
            styles.disabledButton,
          ]}

          disabled={
            !isSetupValid ||
            waitingForRelease ||
            trialResults.length >= TRIAL_COUNT
          }

          onPress={
            startTrial
          }
        >

          <Text
            style={
              styles.buttonText
            }
          >

            {trialResults.length >= TRIAL_COUNT
              ? `BEST SCORE  ${bestScore?.toFixed(1) ?? '--'} cm`
              : waitingForRelease
                ? 'RELEASE HAND'
                : isSetupValid
                  ? `START TRIAL ${trialResults.length + 1}`
                  : 'COMPLETE SETUP'}

          </Text>

        </TouchableOpacity>

      </View>

    </View>
  );
}


/* =========================================================
   STATUS ROW
========================================================= */

function StatusRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {

  return (

    <View
      style={
        styles.statusRow
      }
    >

      <Text
        style={
          styles.statusRowLabel
        }
      >

        {label}

      </Text>


      <Text
        style={[
          styles.statusRowValue,

          good
            ? styles.goodText
            : styles.badText,
        ]}
      >

        {good ? '✓ ' : '✕ '}

        {value}

      </Text>

    </View>
  );
}


/* =========================================================
   ANGLE ROW
========================================================= */

function AngleRow({
  label,
  angle,
}: {
  label: string;
  angle: number | null;
}) {

  return (

    <View
      style={
        styles.angleRow
      }
    >

      <Text
        style={
          styles.angleLabel
        }
      >

        {label}

      </Text>


      <Text
        style={
          styles.angleValue
        }
      >

        {angle !== null
          ? `${angle.toFixed(0)}°`
          : '--'}

      </Text>

    </View>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({

    rotateContainer: {
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },

    phonePortraitIcon: {
      width: 78,
      height: 132,
      borderWidth: 4,
      borderColor: '#fff',
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 28,
    },

    phoneSpeaker: {
      position: 'absolute',
      top: 9,
      width: 24,
      height: 3,
      borderRadius: 2,
      backgroundColor: '#fff',
    },

    rotateArrow: {
      color: '#fff',
      fontSize: 42,
      fontWeight: '700',
    },

    rotateTitle: {
      color: '#fff',
      fontSize: 26,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 12,
    },

    rotateText: {
      color: '#ddd',
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      maxWidth: 520,
    },

    rotateHint: {
      color: '#8fbfff',
      fontSize: 13,
      fontWeight: '700',
      marginTop: 16,
      textAlign: 'center',
    },

    container: {
      flex: 1,
      backgroundColor: '#000',
    },


    cameraFeed: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      height: '100%',
    },


    centered: {
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },


    permissionTitle: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 16,
      textAlign: 'center',
    },


    errorTitle: {
      color: '#ff6b6b',
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 16,
    },


    info: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 22,
      marginTop: 16,
      marginBottom: 20,
    },


    primaryButton: {
      backgroundColor: '#1a4d8f',
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 10,
      marginTop: 10,
      minWidth: 220,
      alignItems: 'center',
    },


    secondaryButton: {
      backgroundColor: '#444',
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 10,
      marginTop: 12,
      minWidth: 220,
      alignItems: 'center',
    },


    backButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginTop: 10,
    },


    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },


    overlayTop: {
      position: 'absolute',
      top: 30,
      left: 16,
      right: 16,
    },


    title: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '700',
    },


    subtitle: {
      color: '#ddd',
      fontSize: 13,
      marginTop: 3,
    },


    cleanStatusCard: {
      position: 'absolute',
      top: 72,
      left: 16,
      width: 205,
      backgroundColor: 'rgba(0,0,0,0.72)',
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },

    cleanCardTitle: {
      color: '#ffffff',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.7,
      marginBottom: 7,
    },

    cleanStatusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },

    cleanStatusLabel: {
      color: '#d0d0d0',
      fontSize: 10,
      fontWeight: '600',
    },

    cleanStatusValue: {
      fontSize: 10,
      fontWeight: '900',
    },

    setupReason: {
      marginTop: 6,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.15)',
      color: '#ffdd55',
      fontSize: 10,
      fontWeight: '800',
      lineHeight: 14,
    },

    setupReady: {
      marginTop: 6,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.15)',
      color: '#6dff8b',
      fontSize: 10,
      fontWeight: '800',
    },

    cleanLiveReachCard: {
      position: 'absolute',
      top: 72,
      alignSelf: 'center',
      minWidth: 190,
      backgroundColor: 'rgba(0,0,0,0.78)',
      borderRadius: 14,
      paddingVertical: 9,
      paddingHorizontal: 20,
      alignItems: 'center',
    },

    cleanLiveReachLabel: {
      color: '#d0d0d0',
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.8,
    },

    cleanLiveReachValue: {
      fontSize: 27,
      fontWeight: '900',
      marginTop: 1,
    },

    cleanHoldText: {
      fontSize: 9,
      fontWeight: '900',
      marginTop: 2,
    },

    mutedText: {
      color: '#bbbbbb',
    },

    statusCard: {
      position: 'absolute',
      top: 90,
      left: 16,
      width: 220,
      backgroundColor:
        'rgba(0,0,0,0.68)',
      padding: 12,
      borderRadius: 12,
    },


    statusTitle: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 12,
      marginBottom: 8,
    },


    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 3,
    },


    statusRowLabel: {
      color: '#ddd',
      fontSize: 10,
    },


    statusRowValue: {
      fontSize: 10,
      fontWeight: '700',
      marginLeft: 8,
    },


    liveReachBox: {
      marginTop: 8,
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
      backgroundColor: 'rgba(0,0,0,0.38)',
      alignItems: 'center',
    },

    liveReachLabel: {
      color: '#ffffff',
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
    },

    liveReachValue: {
      fontSize: 18,
      fontWeight: '900',
      marginTop: 2,
    },

    liveReachHint: {
      color: '#bbbbbb',
      fontSize: 8,
      marginTop: 2,
      textAlign: 'center',
    },

    reachStabilityText: {
      fontSize: 9,
      fontWeight: '800',
      marginTop: 3,
      textAlign: 'center',
    },

    warningText: {
      color: '#ffdd55',
    },

    goodText: {
      color: '#6dff8b',
    },


    badText: {
      color: '#ff7777',
    },


    landmarkDot: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        'rgba(0,255,0,0.95)',
      borderWidth: 1,
      borderColor: '#ffffff',
    },


    fingertipDot: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,165,0,0.85)',
      borderWidth: 1,
      borderColor: '#ffffff',
    },


    forwardMostFingertipDot: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#ffff00',
      borderWidth: 2,
      borderColor: '#ff0000',
      zIndex: 999,
    },


    angleCard: {
      position: 'absolute',
      top: 90,
      right: 16,
      width: 135,
      backgroundColor:
        'rgba(0,0,0,0.68)',
      padding: 10,
      borderRadius: 12,
    },


    angleTitle: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 11,
      marginBottom: 7,
      textAlign: 'center',
    },


    angleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },


    angleLabel: {
      color: '#ccc',
      fontSize: 9,
    },


    angleValue: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
    },


    postureResult: {
      marginTop: 7,
      fontSize: 10,
      fontWeight: '800',
      textAlign: 'center',
    },


    diagnosticBadge: {
      position: 'absolute',
      top: 270,
      left: 16,
      backgroundColor:
        'rgba(0,0,0,0.60)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },


    diagnosticText: {
      color: '#ddd',
      fontSize: 10,
    },


    bestScoreBox: {
      position: 'absolute',
      bottom: 150,
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.78)',
      borderWidth: 1,
      borderColor: '#6dff8b',
      borderRadius: 10,
      paddingVertical: 7,
      paddingHorizontal: 18,
      alignItems: 'center',
    },

    bestScoreLabel: {
      color: '#cccccc',
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
    },

    bestScoreValue: {
      color: '#6dff8b',
      fontSize: 20,
      fontWeight: '900',
      marginTop: 1,
    },

    trialResults: {
      position: 'absolute',
      bottom: 95,
      left: 16,
      right: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },


    trialResultBox: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.65)',
      paddingVertical: 8,
      marginHorizontal: 3,
      borderRadius: 8,
      alignItems: 'center',
    },


    trialResultLabel: {
      color: '#bbb',
      fontSize: 10,
    },


    trialResultValue: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
      marginTop: 2,
    },


    trialGuidance: {
      position: 'absolute',
      bottom: 78,
      left: 190,
      right: 190,
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    },

    trialGuidanceText: {
      backgroundColor: 'rgba(0,0,0,0.76)',
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: 10,
      fontWeight: '900',
      textAlign: 'center',
    },

    controls: {
      position: 'absolute',
      bottom: 25,
      left: 16,
      right: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },


    backControl: {
      backgroundColor:
        'rgba(0,0,0,0.70)',
      paddingHorizontal: 20,
      paddingVertical: 13,
      borderRadius: 10,
    },


    startTrialButton: {
      backgroundColor: '#1a4d8f',
      paddingHorizontal: 22,
      paddingVertical: 13,
      borderRadius: 10,
      minWidth: 175,
      alignItems: 'center',
    },


    disabledButton: {
      backgroundColor:
        'rgba(80,80,80,0.85)',
    },

  });