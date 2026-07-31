import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LCDOverlayProps {
  instructionText?: string;
  isAutoCapture?: boolean;
}

export const LCDOverlay: React.FC<LCDOverlayProps> = ({
  instructionText = 'Align LCD Display within box',
  isAutoCapture = false
}) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Outer Dimmed Framing Mask */}
      <View style={styles.topMask} />
      
      <View style={styles.middleRow}>
        <View style={styles.sideMask} />
        
        {/* Target LCD Frame Box */}
        <View style={[styles.targetBox, isAutoCapture && styles.autoCaptureBorder]}>
          {/* Corner Markers */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          <Text style={styles.lcdLabel}>SCALE DISPLAY LCD</Text>
        </View>

        <View style={styles.sideMask} />
      </View>

      <View style={styles.bottomMask}>
        <Text style={styles.instruction}>{instructionText}</Text>
        {isAutoCapture && (
          <View style={styles.autoBadge}>
            <Text style={styles.autoText}>AUTO-CAPTURE ACTIVE</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  topMask: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.55)'
  },
  middleRow: {
    flexDirection: 'row',
    height: 160
  },
  sideMask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)'
  },
  targetBox: {
    width: 280,
    height: 160,
    borderWidth: 2,
    borderColor: '#00E676',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
    position: 'relative'
  },
  autoCaptureBorder: {
    borderColor: '#FFD600',
    backgroundColor: 'rgba(255, 214, 0, 0.08)'
  },
  lcdLabel: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    opacity: 0.8
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFFFFF'
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10
  },
  bottomMask: {
    flex: 1.5,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    paddingTop: 24
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center'
  },
  autoBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFD600',
    borderRadius: 20
  },
  autoText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800'
  }
});
