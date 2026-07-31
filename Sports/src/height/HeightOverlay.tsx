import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Defs, Marker, Path } from 'react-native-svg';
import type { HeightState } from '@hooks/useHeightCalculation';
import type { MeasurementStatus } from './HeightTypes';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Colors ───────────────────────────────────────────────────────────────────
const C_GREEN  = '#22c55e';
const C_AMBER  = '#f59e0b';
const C_RED    = '#ef4444';
const C_BLUE   = '#3b82f6';
const C_WHITE  = '#f3f4f6';

interface Props {
  heightState: HeightState;
}

function toScreenX(px: number, fw: number) { return (px / fw) * SW; }
function toScreenY(py: number, fh: number) { return (py / fh) * SH; }

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<MeasurementStatus, { label: string; color: string }> = {
  SEARCHING:       { label: '🔍 Searching…',       color: C_RED   },
  MARKER_DETECTED: { label: '📐 Marker Detected',  color: C_AMBER },
  POSE_LOCKED:     { label: '🧍 Pose Locked',       color: C_BLUE  },
  HOLD_STILL:      { label: '🛑 Hold Still…',       color: C_AMBER },
  HEIGHT_MEASURED: { label: '✅ Height Measured',   color: C_GREEN },
};

export const HeightOverlay = memo(function HeightOverlay({ heightState }: Props) {
  const { status, measurement, smoothed, errorReason, frameWidth, frameHeight } = heightState;
  const statusCfg = STATUS_CONFIG[status];

  const hasMeasurement = measurement !== null && smoothed !== null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      {/* SVG layer: measurement line + head/heel points */}
      {hasMeasurement && measurement && (
        <MeasurementSvg
          headX={toScreenX(measurement.headVertex.x, frameWidth)}
          headY={toScreenY(measurement.headVertex.y, frameHeight)}
          heelX={toScreenX(measurement.heelPoint.x,  frameWidth)}
          heelY={toScreenY(measurement.heelPoint.y,  frameHeight)}
          isStable={smoothed!.isStable}
        />
      )}

      {/* Height value badge — centred horizontally, upper third */}
      {hasMeasurement && smoothed && (
        <View style={[
          styles.heightBadge,
          smoothed.isStable ? styles.heightBadgeStable : styles.heightBadgePending,
        ]}>
          <Text style={styles.heightValue}>
            {smoothed.heightCm.toFixed(1)} cm
          </Text>
          {measurement && (
            <Text style={styles.heightSub}>
              {smoothed.isStable ? '✓ Stable' : `${Math.round(smoothed.stableForMs / 100) / 10}s / 1.5s`}
            </Text>
          )}
        </View>
      )}

      {/* Status badge */}
      <View style={[styles.statusBadge, { borderColor: statusCfg.color }]}>
        <Text style={[styles.statusText, { color: statusCfg.color }]}>
          {statusCfg.label}
        </Text>
      </View>

      {/* Error / instruction message */}
      {!hasMeasurement && errorReason && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorReason}</Text>
        </View>
      )}

      {/* Confidence + details panel (only when measuring) */}
      {hasMeasurement && measurement && (
        <View style={styles.detailPanel}>
          <DetailRow label="Confidence"  value={`${measurement.overallConfidence}%`}
            color={measurement.overallConfidence >= 70 ? C_GREEN : C_AMBER} />
          <DetailRow label="cm/px"       value={measurement.markerScale.toFixed(4)} />
          <DetailRow label="Px height"   value={`${measurement.heightPixels} px`} />
          <DetailRow label="Marker conf" value={`${measurement.markerConfidence.toFixed(0)}%`} />
          <DetailRow label="Pose conf"   value={`${measurement.poseConfidence.toFixed(0)}%`} />
          <DetailRow label="Latency"     value={`${measurement.processingTimeMs} ms`} />
        </View>
      )}
    </View>
  );
});

// ─── SVG measurement line ─────────────────────────────────────────────────────
const MeasurementSvg = memo(function MeasurementSvg({
  headX, headY, heelX, heelY, isStable,
}: {
  headX: number; headY: number;
  heelX: number; heelY: number;
  isStable: boolean;
}) {
  const lineColor = isStable ? C_GREEN : C_AMBER;
  const midX = (headX + heelX) / 2;

  return (
    <Svg style={StyleSheet.absoluteFill} width={SW} height={SH}>
      {/* Vertical measurement line */}
      <Line
        x1={midX} y1={headY}
        x2={midX} y2={heelY}
        stroke={lineColor}
        strokeWidth={2}
        strokeDasharray="6,4"
      />
      {/* Horizontal cap at head */}
      <Line
        x1={midX - 12} y1={headY}
        x2={midX + 12} y2={headY}
        stroke={lineColor}
        strokeWidth={2.5}
      />
      {/* Horizontal cap at heel */}
      <Line
        x1={midX - 12} y1={heelY}
        x2={midX + 12} y2={heelY}
        stroke={lineColor}
        strokeWidth={2.5}
      />
      {/* Head vertex dot */}
      <Circle
        cx={headX} cy={headY}
        r={7}
        fill={isStable ? C_GREEN : C_AMBER}
        stroke="rgba(0,0,0,0.5)"
        strokeWidth={1.5}
      />
      {/* Heel dot */}
      <Circle
        cx={heelX} cy={heelY}
        r={7}
        fill={isStable ? C_GREEN : C_AMBER}
        stroke="rgba(0,0,0,0.5)"
        strokeWidth={1.5}
      />
    </Svg>
  );
});

// ─── Detail row ───────────────────────────────────────────────────────────────
function DetailRow({
  label, value, color = C_WHITE,
}: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  heightBadge: {
    position: 'absolute',
    top: SH * 0.12,
    alignSelf: 'center',
    left: SW * 0.25,
    right: SW * 0.25,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
  },
  heightBadgeStable: {
    backgroundColor: 'rgba(34,197,94,0.18)',
    borderColor: C_GREEN,
  },
  heightBadgePending: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: C_AMBER,
  },
  heightValue: {
    color: C_WHITE,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heightSub: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    left: SW * 0.15,
    right: SW * 0.15,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 130,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailPanel: {
    position: 'absolute',
    bottom: 160,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    padding: 10,
    minWidth: 180,
    gap: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  detailLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '700',
  },
});
