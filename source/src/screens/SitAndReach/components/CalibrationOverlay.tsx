import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';

/* ============================================================
   TYPES
   ============================================================ */

interface MarkerState {
  x?: number;
  y?: number;
  detected: boolean;
}

interface CalibrationState {
  /**
   * true = a usable locked homography exists
   */
  valid: boolean;

  /**
   * true = calibration has been successfully locked
   */
  locked?: boolean;

  /**
   * true = all four markers are visible RIGHT NOW
   */
  markersVisible?: boolean;

  stability: string;

  markerA: MarkerState | null;
  markerB: MarkerState | null;
  markerC: MarkerState | null;
  markerD: MarkerState | null;

  homography?: number[];

  failReason?: string;
}

interface Props {
  calibration: CalibrationState | null;
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CalibrationOverlay({
  calibration,
}: Props) {
  const c = calibration;

  /* ==========================================================
     PREVIEW SIZE
     ========================================================== */

  const [previewSize, setPreviewSize] = useState({
    width: 0,
    height: 0,
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setPreviewSize(prev => {
      if (
        prev.width === width &&
        prev.height === height
      ) {
        return prev;
      }

      return {
        width,
        height,
      };
    });
  };

  /* ==========================================================
     LIVE MARKER STATE
     ========================================================== */

  const id1Detected =
    !!c?.markerA?.detected;

  const id2Detected =
    !!c?.markerB?.detected;

  const id3Detected =
    !!c?.markerC?.detected;

  const id4Detected =
    !!c?.markerD?.detected;

  /**
   * Prefer the explicit native markersVisible flag.
   *
   * The fallback makes this component compatible if an older
   * native event is received.
   */
  const markersVisible =
    c?.markersVisible ??
    (
      id1Detected &&
      id2Detected &&
      id3Detected &&
      id4Detected
    );

  /* ==========================================================
     LOCKED CALIBRATION STATE
     ========================================================== */

  const calibrationLocked =
    c?.locked ?? false;

  const calibrationValid =
    c?.valid ?? false;

  const transformReady =
    calibrationLocked &&
    calibrationValid;

  const stabilityText =
    c?.stability ?? '0/5';

  /* ==========================================================
     MARKER POSITION CONVERSION
     ========================================================== */

  /**
   * Native detector sends normalized coordinates:
   *
   * x = 0.0 -> 1.0
   * y = 0.0 -> 1.0
   *
   * We convert them into coordinates inside the actual
   * camera preview overlay.
   */
  const getMarkerPosition = (
    marker: MarkerState,
  ) => {
    if (
      previewSize.width <= 0 ||
      previewSize.height <= 0
    ) {
      return null;
    }

    if (
      typeof marker.x !== 'number' ||
      typeof marker.y !== 'number'
    ) {
      return null;
    }

    return {
      left:
        marker.x *
        previewSize.width -
        8,

      top:
        marker.y *
        previewSize.height -
        8,
    };
  };

  const markerAPosition =
    id1Detected && c?.markerA
      ? getMarkerPosition(c.markerA)
      : null;

  const markerBPosition =
    id2Detected && c?.markerB
      ? getMarkerPosition(c.markerB)
      : null;

  const markerCPosition =
    id3Detected && c?.markerC
      ? getMarkerPosition(c.markerC)
      : null;

  const markerDPosition =
    id4Detected && c?.markerD
      ? getMarkerPosition(c.markerD)
      : null;

  /* ==========================================================
     STATUS MESSAGE
     ========================================================== */

  let statusMessage =
    'Show all 4 reference markers';

  if (
    markersVisible &&
    !calibrationLocked
  ) {
    statusMessage =
      `Hold camera still (${stabilityText})`;
  }

  if (
    calibrationLocked &&
    markersVisible
  ) {
    statusMessage =
      'Calibration locked — markers visible';
  }

  if (
    calibrationLocked &&
    !markersVisible
  ) {
    statusMessage =
      'Calibration locked — ready for assessment';
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <View
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}
      onLayout={handleLayout}
    >
      {/* ======================================================
          LIVE MARKER DOTS
         ====================================================== */}

      {markerAPosition && (
        <View
          pointerEvents="none"
          style={[
            styles.markerDot,
            styles.markerDotId1,
            markerAPosition,
          ]}
        >
          <Text style={styles.markerDotLabel}>
            1
          </Text>
        </View>
      )}

      {markerBPosition && (
        <View
          pointerEvents="none"
          style={[
            styles.markerDot,
            styles.markerDotId2,
            markerBPosition,
          ]}
        >
          <Text style={styles.markerDotLabel}>
            2
          </Text>
        </View>
      )}

      {markerCPosition && (
        <View
          pointerEvents="none"
          style={[
            styles.markerDot,
            styles.markerDotId3,
            markerCPosition,
          ]}
        >
          <Text style={styles.markerDotLabel}>
            3
          </Text>
        </View>
      )}

      {markerDPosition && (
        <View
          pointerEvents="none"
          style={[
            styles.markerDot,
            styles.markerDotId4,
            markerDPosition,
          ]}
        >
          <Text style={styles.markerDotLabel}>
            4
          </Text>
        </View>
      )}

      {/* ======================================================
          CALIBRATION PANEL
         ====================================================== */}

      <View
        style={styles.panel}
        pointerEvents="none"
      >
        <Text style={styles.panelTitle}>
          REFERENCE CALIBRATION
        </Text>

        {/* ----------------------------------------------------
            LIVE MARKER DETECTION
           ---------------------------------------------------- */}

        <Text style={styles.sectionTitle}>
          LIVE MARKERS
        </Text>

        <StatusRow
          label="ID 1"
          detected={id1Detected}
        />

        <StatusRow
          label="ID 2"
          detected={id2Detected}
        />

        <StatusRow
          label="ID 3"
          detected={id3Detected}
        />

        <StatusRow
          label="ID 4"
          detected={id4Detected}
        />

        <View style={styles.divider} />

        {/* ----------------------------------------------------
            MARKERS CURRENTLY VISIBLE
           ---------------------------------------------------- */}

        <StateRow
          label="Markers Visible"
          value={
            markersVisible
              ? 'YES'
              : 'NO'
          }
          state={
            markersVisible
              ? 'good'
              : 'bad'
          }
        />

        {/* ----------------------------------------------------
            STABILITY
           ---------------------------------------------------- */}

        <StateRow
          label="Stability"
          value={stabilityText}
          state={
            calibrationLocked
              ? 'good'
              : markersVisible
                ? 'warning'
                : 'neutral'
          }
        />

        <View style={styles.divider} />

        {/* ----------------------------------------------------
            CALIBRATION LOCK
           ---------------------------------------------------- */}

        <StateRow
          label="Calibration"
          value={
            calibrationLocked
              ? 'LOCKED'
              : 'UNLOCKED'
          }
          state={
            calibrationLocked
              ? 'good'
              : 'warning'
          }
        />

        {/* ----------------------------------------------------
            TRANSFORM
           ---------------------------------------------------- */}

        <StateRow
          label="Transform"
          value={
            transformReady
              ? 'READY'
              : 'PENDING'
          }
          state={
            transformReady
              ? 'good'
              : 'warning'
          }
        />

        {/* ====================================================
            MAIN STATUS BADGE
           ==================================================== */}

        <View
          style={[
            styles.calibBadge,

            calibrationLocked
              ? styles.calibLocked
              : markersVisible
                ? styles.calibDetecting
                : styles.calibWaiting,
          ]}
        >
          <Text style={styles.calibText}>
            {calibrationLocked
              ? 'CALIBRATION LOCKED'
              : markersVisible
                ? 'CALIBRATING...'
                : 'WAITING FOR MARKERS'}
          </Text>
        </View>

        {/* ====================================================
            USER INSTRUCTION
           ==================================================== */}

        <Text
          style={[
            styles.statusMessage,

            calibrationLocked
              ? styles.statusReady
              : styles.statusWaiting,
          ]}
        >
          {statusMessage}
        </Text>

        {/* ====================================================
            FAILURE REASON

            Do NOT show marker-loss errors after calibration
            has already been locked.
           ==================================================== */}

        {!calibrationLocked &&
          c?.failReason ? (
          <Text style={styles.failReason}>
            {c.failReason}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ============================================================
   LIVE MARKER STATUS ROW
   ============================================================ */

function StatusRow({
  label,
  detected,
}: {
  label: string;
  detected: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.rowValue,
          detected
            ? styles.good
            : styles.bad,
        ]}
      >
        {detected
          ? 'DETECTED'
          : 'NOT DETECTED'}
      </Text>
    </View>
  );
}

/* ============================================================
   GENERAL STATE ROW
   ============================================================ */

type RowState =
  | 'good'
  | 'bad'
  | 'warning'
  | 'neutral';

function StateRow({
  label,
  value,
  state,
}: {
  label: string;
  value: string;
  state: RowState;
}) {
  let valueStyle =
    styles.neutral;

  if (state === 'good') {
    valueStyle =
      styles.good;
  }

  if (state === 'bad') {
    valueStyle =
      styles.bad;
  }

  if (state === 'warning') {
    valueStyle =
      styles.warning;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.rowValue,
          valueStyle,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',

    bottom: 90,
    right: 12,

    width: 220,

    backgroundColor:
      'rgba(0,0,0,0.82)',

    borderRadius: 12,

    paddingHorizontal: 12,
    paddingVertical: 12,

    borderWidth: 1,

    borderColor:
      'rgba(255,255,255,0.12)',
  },

  panelTitle: {
    color: '#ffffff',

    fontWeight: '800',

    fontSize: 12,

    letterSpacing: 0.5,

    marginBottom: 8,

    textAlign: 'center',
  },

  sectionTitle: {
    color: '#aaaaaa',

    fontSize: 8,

    fontWeight: '700',

    letterSpacing: 0.8,

    marginBottom: 6,
  },

  row: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginBottom: 5,
  },

  rowLabel: {
    color: '#cccccc',

    fontSize: 10,

    marginRight: 8,
  },

  rowValue: {
    fontSize: 10,

    fontWeight: '800',

    textAlign: 'right',
  },

  /* ==========================================================
     STATUS COLOURS
     ========================================================== */

  good: {
    color: '#6dff8b',
  },

  bad: {
    color: '#ff7777',
  },

  warning: {
    color: '#ffdd55',
  },

  neutral: {
    color: '#bbbbbb',
  },

  divider: {
    height: 1,

    backgroundColor:
      'rgba(255,255,255,0.15)',

    marginVertical: 7,
  },

  /* ==========================================================
     CALIBRATION BADGE
     ========================================================== */

  calibBadge: {
    marginTop: 8,

    paddingVertical: 6,

    paddingHorizontal: 6,

    borderRadius: 6,

    alignItems: 'center',

    borderWidth: 1,
  },

  calibLocked: {
    backgroundColor:
      'rgba(0,200,80,0.22)',

    borderColor:
      '#6dff8b',
  },

  calibDetecting: {
    backgroundColor:
      'rgba(255,200,0,0.15)',

    borderColor:
      '#ffdd55',
  },

  calibWaiting: {
    backgroundColor:
      'rgba(200,0,0,0.16)',

    borderColor:
      '#ff7777',
  },

  calibText: {
    color: '#ffffff',

    fontWeight: '800',

    fontSize: 10,

    textAlign: 'center',
  },

  /* ==========================================================
     INSTRUCTION
     ========================================================== */

  statusMessage: {
    marginTop: 7,

    fontSize: 9,

    fontWeight: '600',

    textAlign: 'center',
  },

  statusReady: {
    color: '#6dff8b',
  },

  statusWaiting: {
    color: '#dddddd',
  },

  failReason: {
    color: '#ffaa44',

    fontSize: 8,

    marginTop: 5,

    textAlign: 'center',
  },

  /* ==========================================================
     MARKER DOTS
     ========================================================== */

  markerDot: {
    position: 'absolute',

    width: 16,
    height: 16,

    borderRadius: 8,

    borderWidth: 2,

    justifyContent: 'center',

    alignItems: 'center',

    zIndex: 100,
  },

  markerDotId1: {
    backgroundColor:
      'rgba(0,200,255,0.7)',

    borderColor:
      '#00c8ff',
  },

  markerDotId2: {
    backgroundColor:
      'rgba(255,200,0,0.7)',

    borderColor:
      '#ffc800',
  },

  markerDotId3: {
    backgroundColor:
      'rgba(0,255,100,0.7)',

    borderColor:
      '#00ff64',
  },

  markerDotId4: {
    backgroundColor:
      'rgba(255,80,80,0.7)',

    borderColor:
      '#ff5050',
  },

  markerDotLabel: {
    color: '#ffffff',

    fontSize: 8,

    fontWeight: '800',
  },
});