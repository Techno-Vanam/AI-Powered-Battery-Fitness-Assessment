import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';
import type { ArucoResult } from './Types';
import { confidenceLabel } from './ArucoMath';

const { width: SW, height: SH } = Dimensions.get('window');

interface Props {
  result: ArucoResult;
  frameWidth: number;
  frameHeight: number;
}

function scalePoint(
  x: number,
  y: number,
  frameW: number,
  frameH: number,
): { sx: number; sy: number } {
  return { sx: (x / frameW) * SW, sy: (y / frameH) * SH };
}

export const ArucoOverlay = memo(function ArucoOverlay({
  result,
  frameWidth,
  frameHeight,
}: Props) {
  if (!result.detected) {
    const msg =
      result.reason === 'MARKER_TOO_SMALL'
        ? 'Move Camera Closer'
        : 'Marker Not Detected';
    return (
      <View style={styles.missContainer} pointerEvents="none">
        <Text style={styles.missText}>{msg}</Text>
      </View>
    );
  }

  const { corners, markerId, markerWidthPixels, markerHeightPixels,
          rotationAngle, cmPerPixel, confidence } = result;

  const scaled = corners.map(c =>
    scalePoint(c.x, c.y, frameWidth, frameHeight),
  );

  const polygonPoints = scaled
    .map(p => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`)
    .join(' ');

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Polygon + corner dots */}
      <Svg style={StyleSheet.absoluteFill} width={SW} height={SH}>
        <Polygon
          points={polygonPoints}
          fill="rgba(34,197,94,0.12)"
          stroke="#22c55e"
          strokeWidth={2.5}
        />
        {scaled.map((p, i) => (
          <Circle key={i} cx={p.sx} cy={p.sy} r={6} fill="#22c55e" />
        ))}
      </Svg>

      {/* Stats panel */}
      <View style={styles.statsPanel}>
        <StatRow label="ID"         value={String(markerId)} />
        <StatRow label="Width"      value={`${markerWidthPixels.toFixed(0)} px`} />
        <StatRow label="Height"     value={`${markerHeightPixels.toFixed(0)} px`} />
        <StatRow label="Rotation"   value={`${rotationAngle.toFixed(1)}°`} />
        <StatRow label="cm/px"      value={cmPerPixel.toFixed(4)} />
        <StatRow
          label="Confidence"
          value={`${confidence.toFixed(0)}% · ${confidenceLabel(confidence)}`}
          highlight={confidence >= 60}
        />
      </View>
    </View>
  );
});

function StatRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.valueGreen]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  missContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  missText: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statsPanel: {
    position: 'absolute',
    top: 80,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    padding: 10,
    gap: 4,
    minWidth: 190,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  value: {
    color: '#f3f4f6',
    fontSize: 12,
    fontWeight: '600',
  },
  valueGreen: {
    color: '#22c55e',
  },
});
