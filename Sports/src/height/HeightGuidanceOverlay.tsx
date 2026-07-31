import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, Circle, G, Path, Text as SvgText } from 'react-native-svg';
import type { HeightState } from '@hooks/useHeightCalculation';
import type { GuidanceState } from './HeightTypes';
import type { PoseResult, Landmark } from '@vision/pose/PoseTypes';
import { SKELETON_CONNECTIONS, LM, VISIBILITY_THRESHOLD } from '@vision/pose/PoseTypes';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Colors ───────────────────────────────────────────────────────────────────
const C_GREEN  = '#22c55e';
const C_AMBER  = '#f59e0b';
const C_RED    = '#ef4444';
const C_BLUE   = '#3b82f6';
const C_WHITE  = '#ffffff';

interface Props {
  heightState: HeightState;
  guidanceState: GuidanceState;
  poseResult?: PoseResult | null;
}

function toScreenX(px: number, fw: number) { return (px / fw) * SW; }
function toScreenY(py: number, fh: number) { return (py / fh) * SH; }

export const HeightGuidanceOverlay = memo(function HeightGuidanceOverlay({
  heightState,
  guidanceState,
  poseResult,
}: Props) {
  const { measurement, smoothed, frameWidth, frameHeight } = heightState;
  const { allPassed, primaryMessage, countdown } = guidanceState;

  const mainColor = allPassed ? C_GREEN : C_AMBER;

  // Guide box coordinates (center framing rectangle)
  const rectW = SW * 0.72;
  const rectH = SH * 0.76;
  const rectX = (SW - rectW) / 2;
  const rectY = SH * 0.12;

  // Foot guide coordinates (bottom of guide rectangle)
  const footWidth = 40;
  const footHeight = 24;
  const leftFootX = rectX + rectW * 0.3 - footWidth / 2;
  const rightFootX = rectX + rectW * 0.7 - footWidth / 2;
  const footY = rectY + rectH - 36;

  // Marker placement guide coordinates (lower left corner of guide box)
  const markerGuideX = rectX - 10;
  const markerGuideY = rectY + rectH - 70;
  const markerGuideW = 64;
  const markerGuideH = 64;

  const hasMeasurement = measurement !== null && smoothed !== null;
  const landmarks = poseResult && poseResult.detected ? poseResult.landmarks : null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      {/* SVG Overlays: Guide Frame, Foot Guides, Marker Box, Skeleton, Laser Line */}
      <Svg style={StyleSheet.absoluteFill} width={SW} height={SH}>
        {/* 1. Guide Rectangle */}
        <Rect
          x={rectX}
          y={rectY}
          width={rectW}
          height={rectH}
          rx={20}
          fill="none"
          stroke={mainColor}
          strokeWidth={allPassed ? 3 : 2}
          strokeDasharray={allPassed ? undefined : '10,6'}
        />

        {/* 2. Foot Placement Guides */}
        <G opacity={0.85}>
          {/* Left Foot Outline */}
          <Rect
            x={leftFootX}
            y={footY}
            width={footWidth}
            height={footHeight}
            rx={8}
            fill={guidanceState.checks.FEET_OUTSIDE.passed ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.2)'}
            stroke={guidanceState.checks.FEET_OUTSIDE.passed ? C_GREEN : C_AMBER}
            strokeWidth={1.8}
          />
          <SvgText
            x={leftFootX + footWidth / 2}
            y={footY + 16}
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            L FOOT
          </SvgText>

          {/* Right Foot Outline */}
          <Rect
            x={rightFootX}
            y={footY}
            width={footWidth}
            height={footHeight}
            rx={8}
            fill={guidanceState.checks.FEET_OUTSIDE.passed ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.2)'}
            stroke={guidanceState.checks.FEET_OUTSIDE.passed ? C_GREEN : C_AMBER}
            strokeWidth={1.8}
          />
          <SvgText
            x={rightFootX + footWidth / 2}
            y={footY + 16}
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            R FOOT
          </SvgText>
        </G>

        {/* 3. Marker Placement Guide */}
        <G opacity={0.9}>
          <Rect
            x={markerGuideX}
            y={markerGuideY}
            width={markerGuideW}
            height={markerGuideH}
            rx={10}
            fill={guidanceState.checks.MARKER_MISSING.passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}
            stroke={guidanceState.checks.MARKER_MISSING.passed ? C_GREEN : C_RED}
            strokeWidth={2}
            strokeDasharray="6,4"
          />
          <SvgText
            x={markerGuideX + markerGuideW / 2}
            y={markerGuideY + 28}
            fill="#ffffff"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
          >
            21cm
          </SvgText>
          <SvgText
            x={markerGuideX + markerGuideW / 2}
            y={markerGuideY + 44}
            fill="#ffffff"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
          >
            MARKER
          </SvgText>
        </G>

        {/* 4. Skeleton Overlay */}
        {landmarks && (
          <G>
            {/* Skeleton Bones */}
            {SKELETON_CONNECTIONS.map(([a, b], i) => {
              const lmA = landmarks[a];
              const lmB = landmarks[b];
              if (!lmA || !lmB) return null;
              const bothVis = lmA.visibility >= VISIBILITY_THRESHOLD && lmB.visibility >= VISIBILITY_THRESHOLD;
              return (
                <Line
                  key={`bone-${i}`}
                  x1={toScreenX(lmA.x, frameWidth)}
                  y1={toScreenY(lmA.y, frameHeight)}
                  x2={toScreenX(lmB.x, frameWidth)}
                  y2={toScreenY(lmB.y, frameHeight)}
                  stroke={allPassed ? 'rgba(34,197,94,0.85)' : bothVis ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.5)'}
                  strokeWidth={bothVis ? 2.5 : 1.5}
                />
              );
            })}
            {/* Keypoints */}
            {landmarks.map((lm, i) => {
              if (
                i === LM.LEFT_EYE_INNER || i === LM.RIGHT_EYE_INNER ||
                i === LM.MOUTH_LEFT     || i === LM.MOUTH_RIGHT
              ) return null;

              const vis = lm.visibility >= VISIBILITY_THRESHOLD;
              return (
                <Circle
                  key={`pt-${i}`}
                  cx={toScreenX(lm.x, frameWidth)}
                  cy={toScreenY(lm.y, frameHeight)}
                  r={vis ? 4.5 : 3}
                  fill={vis ? (allPassed ? C_GREEN : C_AMBER) : C_RED}
                  stroke="#000000"
                  strokeWidth={1}
                />
              );
            })}
          </G>
        )}

        {/* 5. Measurement Laser Line & Markers */}
        {hasMeasurement && measurement && (
          <G>
            {/* Top Head Line */}
            <Line
              x1={rectX + 10}
              y1={toScreenY(measurement.headVertex.y, frameHeight)}
              x2={rectX + rectW - 10}
              y2={toScreenY(measurement.headVertex.y, frameHeight)}
              stroke={C_GREEN}
              strokeWidth={3}
            />
            {/* Bottom Heel Line */}
            <Line
              x1={rectX + 10}
              y1={toScreenY(measurement.heelPoint.y, frameHeight)}
              x2={rectX + rectW - 10}
              y2={toScreenY(measurement.heelPoint.y, frameHeight)}
              stroke={C_GREEN}
              strokeWidth={3}
            />
            {/* Vertical Laser Span */}
            <Line
              x1={SW / 2}
              y1={toScreenY(measurement.headVertex.y, frameHeight)}
              x2={SW / 2}
              y2={toScreenY(measurement.heelPoint.y, frameHeight)}
              stroke={C_GREEN}
              strokeWidth={2}
              strokeDasharray="4,4"
            />
          </G>
        )}
      </Svg>

      {/* Real-time Guidance Message Banner */}
      <View style={[
        styles.guidanceBanner,
        allPassed ? styles.guidanceBannerSuccess : styles.guidanceBannerWarning
      ]}>
        <Text style={styles.guidanceIcon}>
          {allPassed ? '✓' : '💡'}
        </Text>
        <Text style={styles.guidanceText}>
          {primaryMessage}
        </Text>
      </View>

      {/* Height Value Pill (Upper Region) */}
      {hasMeasurement && smoothed && (
        <View style={styles.heightBadge}>
          <Text style={styles.heightValue}>
            {smoothed.heightCm.toFixed(1)} <Text style={styles.unitText}>cm</Text>
          </Text>
        </View>
      )}

      {/* Countdown Display overlay (3... 2... 1...) */}
      {countdown !== null && countdown > 0 && (
        <View style={styles.countdownContainer}>
          <View style={styles.countdownCircle}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
          <Text style={styles.countdownSub}>Auto Measuring...</Text>
        </View>
      )}

    </View>
  );
});

const styles = StyleSheet.create({
  guidanceBanner: {
    position: 'absolute',
    top: 56,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  guidanceBannerWarning: {
    backgroundColor: 'rgba(245,158,11,0.92)',
  },
  guidanceBannerSuccess: {
    backgroundColor: 'rgba(34,197,94,0.92)',
  },
  guidanceIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  guidanceText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heightBadge: {
    position: 'absolute',
    top: SH * 0.15,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C_GREEN,
  },
  heightValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
  },
  unitText: {
    fontSize: 18,
    fontWeight: '600',
    color: C_GREEN,
  },
  countdownContainer: {
    position: 'absolute',
    top: SH * 0.38,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(34,197,94,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  countdownText: {
    color: '#ffffff',
    fontSize: 54,
    fontWeight: '900',
  },
  countdownSub: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 12,
  },
});
