import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guide box: centered, 55% wide, 80% tall — captures full standing person
const BOX_WIDTH = SCREEN_WIDTH * 0.55;
const BOX_HEIGHT = SCREEN_HEIGHT * 0.80;
const BOX_LEFT = (SCREEN_WIDTH - BOX_WIDTH) / 2;
const BOX_TOP = (SCREEN_HEIGHT - BOX_HEIGHT) / 2;

const CORNER_SIZE = 20;
const CORNER_THICKNESS = 3;

export function GuideOverlay() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Dimmed areas outside the guide box */}
      <View style={[styles.dim, { top: 0, left: 0, right: 0, height: BOX_TOP }]} />
      <View style={[styles.dim, { top: BOX_TOP + BOX_HEIGHT, left: 0, right: 0, bottom: 0 }]} />
      <View style={[styles.dim, { top: BOX_TOP, left: 0, width: BOX_LEFT, height: BOX_HEIGHT }]} />
      <View style={[styles.dim, { top: BOX_TOP, left: BOX_LEFT + BOX_WIDTH, right: 0, height: BOX_HEIGHT }]} />

      {/* Corner markers */}
      {/* Top-left */}
      <View style={[styles.cornerH, { top: BOX_TOP, left: BOX_LEFT }]} />
      <View style={[styles.cornerV, { top: BOX_TOP, left: BOX_LEFT }]} />
      {/* Top-right */}
      <View style={[styles.cornerH, { top: BOX_TOP, left: BOX_LEFT + BOX_WIDTH - CORNER_SIZE }]} />
      <View style={[styles.cornerV, { top: BOX_TOP, left: BOX_LEFT + BOX_WIDTH - CORNER_THICKNESS }]} />
      {/* Bottom-left */}
      <View style={[styles.cornerH, { top: BOX_TOP + BOX_HEIGHT - CORNER_THICKNESS, left: BOX_LEFT }]} />
      <View style={[styles.cornerV, { top: BOX_TOP + BOX_HEIGHT - CORNER_SIZE, left: BOX_LEFT }]} />
      {/* Bottom-right */}
      <View style={[styles.cornerH, { top: BOX_TOP + BOX_HEIGHT - CORNER_THICKNESS, left: BOX_LEFT + BOX_WIDTH - CORNER_SIZE }]} />
      <View style={[styles.cornerV, { top: BOX_TOP + BOX_HEIGHT - CORNER_SIZE, left: BOX_LEFT + BOX_WIDTH - CORNER_THICKNESS }]} />

      {/* Instruction label */}
      <View style={[styles.labelContainer, { top: BOX_TOP + BOX_HEIGHT + 12, left: BOX_LEFT, width: BOX_WIDTH }]}>
        <Text style={styles.labelText}>Stand inside the guide box.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cornerH: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_THICKNESS,
    backgroundColor: '#22c55e',
  },
  cornerV: {
    position: 'absolute',
    width: CORNER_THICKNESS,
    height: CORNER_SIZE,
    backgroundColor: '#22c55e',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  labelText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
