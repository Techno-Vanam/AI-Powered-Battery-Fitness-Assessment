import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import AppText from '../ui/AppText';
import { fontFamily } from '../../theme/fonts';
import { colors } from '../../theme';

type Props = {
  percent: number;
  completed?: number;
  remaining?: number;
  inProgress?: number;
  total?: number;
  size?: number;
  strokeWidth?: number;
};

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

/**
 * Chart.js Style Doughnut Chart Component for React Native.
 * Renders multi-colored doughnut segments with crisp Chart.js style dividers and central progress percentage.
 */
export default function DonutChart({
  percent,
  completed = 7,
  remaining = 3,
  inProgress = 0,
  total = 10,
  size = 96,
  strokeWidth = 14,
}: Props) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  // Chart.js segment dataset configuration
  const segments = [
    { value: completed > 0 ? completed : 0, color: '#38BDF8', label: 'Completed' }, // Chart.js Cyan
    { value: inProgress > 0 ? inProgress : 0, color: '#FACC15', label: 'In Progress' }, // Chart.js Yellow
    { value: remaining > 0 ? remaining : 0, color: '#FB923C', label: 'Remaining' }, // Chart.js Orange
  ].filter(s => s.value > 0);

  const totalValue = segments.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const gapDegree = segments.length > 1 ? 4 : 0; // Chart.js border gap spacing between slices
  let currentAngle = 0;

  const paths = segments.map((segment, index) => {
    const sweepAngle = (segment.value / totalValue) * 360;
    const startAngle = currentAngle + gapDegree / 2;
    const endAngle = currentAngle + sweepAngle - gapDegree / 2;
    currentAngle += sweepAngle;

    if (endAngle <= startAngle) return null;

    const d = describeArc(center, center, radius, startAngle, endAngle);
    return (
      <Path
        key={index}
        d={d}
        fill="transparent"
        stroke={segment.color}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
      />
    );
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <G>{paths}</G>
      </Svg>
      <View style={styles.centerTextContainer}>
        <AppText style={styles.percentText}>{Math.round(percent)}%</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: fontFamily('800'),
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
});
