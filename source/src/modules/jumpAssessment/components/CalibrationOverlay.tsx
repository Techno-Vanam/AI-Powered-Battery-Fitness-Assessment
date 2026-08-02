/**
 * Calibration Target Bounding Frame Component
 * Displays a compact guidance reticle for ArUco / A4 alignment at full jump distance.
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CalibrationMethod } from '../types/calibration';

interface Props {
  method: CalibrationMethod;
  isDetected: boolean;
}

export const CalibrationOverlay: React.FC<Props> = ({ method, isDetected }) => {
  const isAruco = method === 'aruco';

  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.targetFrame,
          isAruco ? styles.arucoFrame : styles.a4Frame,
          isDetected && styles.detectedFrame,
        ]}
      >
        <Text style={styles.guideText}>
          {isDetected
            ? '✓ Calibrated!'
            : isAruco
            ? '10x10 cm ArUco'
            : 'A4 Paper (Vertical)'}
        </Text>
      </View>
      <Text style={styles.subText}>
        {isDetected
          ? 'Pixel scale captured. Stand in position.'
          : 'Place marker anywhere in view. Keep camera stable.'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  targetFrame: {
    borderWidth: 2,
    borderColor: '#FFD600',
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  arucoFrame: {
    width: 100,
    height: 100,
  },
  a4Frame: {
    width: 90,
    height: 130,
  },
  detectedFrame: {
    borderColor: '#00E676',
    borderStyle: 'solid',
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  subText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
