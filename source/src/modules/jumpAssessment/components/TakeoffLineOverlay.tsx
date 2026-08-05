/**
 * Takeoff Line Overlay for Broad Jump
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface Props {
  takeoffLineX: number | null;
  landingHeelX: number | null;
  width: number;
}

export const TakeoffLineOverlay: React.FC<Props> = ({ takeoffLineX, landingHeelX, width }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {takeoffLineX !== null ? (
        <View style={[styles.line, { left: takeoffLineX }]}>
          <Text style={styles.lineLabel}>Takeoff Line</Text>
        </View>
      ) : null}

      {landingHeelX !== null ? (
        <View style={[styles.landingLine, { left: landingHeelX }]}>
          <Text style={styles.landingLabel}>Landing Heel</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#00E676',
    zIndex: 11,
  },
  lineLabel: {
    color: '#00E676',
    fontWeight: 'bold',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 40,
  },
  landingLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#FF3D00',
    zIndex: 11,
  },
  landingLabel: {
    color: '#FF3D00',
    fontWeight: 'bold',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 70,
  },
});
