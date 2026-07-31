import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, G } from 'react-native-svg';
import type { PoseResult, Landmark } from './PoseTypes';
import { SKELETON_CONNECTIONS, LM, VISIBILITY_THRESHOLD } from './PoseTypes';
import { poseConfidenceLabel } from './PoseMath';
import type { ArucoResult } from '@vision/aruco/Types';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLOR_VISIBLE     = '#22c55e';   // green  — high confidence
const COLOR_LOW_VIS     = '#f59e0b';   // amber  — low confidence
const COLOR_MISSING     = '#ef4444';   // red    — not detected
const COLOR_BONE        = 'rgba(34,197,94,0.7)';
const COLOR_BONE_LOW    = 'rgba(245,158,11,0.5)';

interface Props {
  poseResult: PoseResult;
  arucoResult: ArucoResult;
  frameWidth: number;
  frameHeight: number;
  fps: number;
}

function sx(x: number, fw: number) { return (x / fw) * SW; }
function sy(y: number, fh: number) { return (y / fh) * SH; }

function landmarkColor(lm: Landmark): string {
  if (lm.visibility < 0.2) return COLOR_MISSING;
  if (lm.visibility < VISIBILITY_THRESHOLD) return COLOR_LOW_VIS;
  return COLOR_VISIBLE;
}

export const PoseOverlay = memo(function PoseOverlay({
  poseResult,
  arucoResult,
  frameWidth,
  frameHeight,
  fps,
}: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {poseResult.detected && (
        <SkeletonLayer
          landmarks={poseResult.landmarks}
          frameWidth={frameWidth}
          frameHeight={frameHeight}
        />
      )}
      <StatsPanel
        poseResult={poseResult}
        arucoResult={arucoResult}
        fps={fps}
      />
    </View>
  );
});

// ─── Skeleton SVG ─────────────────────────────────────────────────────────────
const SkeletonLayer = memo(function SkeletonLayer({
  landmarks,
  frameWidth,
  frameHeight,
}: {
  landmarks: Landmark[];
  frameWidth: number;
  frameHeight: number;
}) {
  const fw = frameWidth;
  const fh = frameHeight;

  return (
    <Svg style={StyleSheet.absoluteFill} width={SW} height={SH}>
      {/* Skeleton bones */}
      <G>
        {SKELETON_CONNECTIONS.map(([a, b], i) => {
          const lmA = landmarks[a];
          const lmB = landmarks[b];
          if (!lmA || !lmB) return null;
          const bothVisible =
            lmA.visibility >= VISIBILITY_THRESHOLD &&
            lmB.visibility >= VISIBILITY_THRESHOLD;
          return (
            <Line
              key={i}
              x1={sx(lmA.x, fw)}
              y1={sy(lmA.y, fh)}
              x2={sx(lmB.x, fw)}
              y2={sy(lmB.y, fh)}
              stroke={bothVisible ? COLOR_BONE : COLOR_BONE_LOW}
              strokeWidth={bothVisible ? 2.5 : 1.5}
              strokeLinecap="round"
            />
          );
        })}
      </G>

      {/* Landmark dots */}
      <G>
        {landmarks.map((lm, i) => {
          // Skip inner eye/mouth landmarks to reduce clutter
          if (
            i === LM.LEFT_EYE_INNER || i === LM.RIGHT_EYE_INNER ||
            i === LM.MOUTH_LEFT     || i === LM.MOUTH_RIGHT
          ) return null;

          const color = landmarkColor(lm);
          const r = lm.visibility >= VISIBILITY_THRESHOLD ? 5 : 3;
          return (
            <Circle
              key={i}
              cx={sx(lm.x, fw)}
              cy={sy(lm.y, fh)}
              r={r}
              fill={color}
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={1}
            />
          );
        })}
      </G>
    </Svg>
  );
});

// ─── Stats Panel ──────────────────────────────────────────────────────────────
function StatsPanel({
  poseResult,
  arucoResult,
  fps,
}: {
  poseResult: PoseResult;
  arucoResult: ArucoResult;
  fps: number;
}) {
  const fpsColor = fps >= 25 ? COLOR_VISIBLE : fps >= 15 ? '#f59e0b' : COLOR_MISSING;
  const arucoOk  = arucoResult.detected;
  const poseOk   = poseResult.detected;

  return (
    <View style={styles.panel}>
      <PanelRow
        label="FPS"
        value={String(fps)}
        valueColor={fpsColor}
      />
      <PanelRow
        label="ArUco"
        value={arucoOk
          ? `✓ ${(arucoResult as Extract<ArucoResult, { detected: true }>).cmPerPixel.toFixed(4)} cm/px`
          : '✗ Not detected'}
        valueColor={arucoOk ? COLOR_VISIBLE : COLOR_MISSING}
      />
      <PanelRow
        label="Pose"
        value={poseOk ? '✓ Detected' : '✗ Not detected'}
        valueColor={poseOk ? COLOR_VISIBLE : COLOR_MISSING}
      />
      {poseResult.detected ? (
        <>
          <PanelRow
            label="Confidence"
            value={`${poseResult.overallConfidence.toFixed(0)}% · ${poseConfidenceLabel(poseResult.overallConfidence)}`}
            valueColor={poseResult.overallConfidence >= 60 ? COLOR_VISIBLE : '#f59e0b'}
          />
          <PanelRow
            label="Landmarks"
            value={`${poseResult.visibleCount}/33`}
            valueColor={poseResult.visibleCount >= 25 ? COLOR_VISIBLE : '#f59e0b'}
          />
          <PanelRow
            label="Latency"
            value={`${poseResult.processingTimeMs} ms`}
          />
        </>
      ) : (
        <PanelRow
          label="Status"
          value={poseResult.reason}
          valueColor={COLOR_MISSING}
        />
      )}
    </View>
  );
}

function PanelRow({
  label,
  value,
  valueColor = '#f3f4f6',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 80,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.70)',
    borderRadius: 10,
    padding: 10,
    minWidth: 210,
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  value: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
});
