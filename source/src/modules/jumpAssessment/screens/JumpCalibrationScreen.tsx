/**
 * Calibration Screen (ArUco Marker or A4 Paper)
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useJumpCalibration } from '../hooks/useJumpCalibration';
import { CalibrationOverlay } from '../components/CalibrationOverlay';
import { JumpCameraView } from '../components/JumpCameraView';

interface Props {
  navigation: any;
  route: any;
}

export const JumpCalibrationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { testType } = route.params || { testType: 'vertical' };
  const { isCalibrated, pixelsPerCm, method, setMethod, setCalibration } = useJumpCalibration();

  const handleSimulatedCalibration = () => {
    // Simulate detecting ArUco (10cm = 100 pixels -> 10 pixels/cm)
    setCalibration(10.0, method);
  };

  const handleProceed = () => {
    if (testType === 'vertical') {
      navigation.replace('VerticalJump', { pixelsPerCm });
    } else {
      navigation.replace('BroadJump', { pixelsPerCm });
    }
  };

  return (
    <View style={styles.container}>
      <JumpCameraView onFrameProcessed={() => {}} testType={testType} />

      <CalibrationOverlay method={method} isDetected={isCalibrated} />

      {/* Top Method Selector Toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.toggleBtn, method === 'aruco' && styles.activeToggle]}
          onPress={() => setMethod('aruco')}
        >
          <Text style={styles.toggleText}>ArUco Marker (10x10 cm)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, method === 'a4_paper' && styles.activeToggle]}
          onPress={() => setMethod('a4_paper')}
        >
          <Text style={styles.toggleText}>A4 Paper (Vertical)</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {!isCalibrated ? (
          <TouchableOpacity style={styles.calibrateBtn} onPress={handleSimulatedCalibration}>
            <Text style={styles.btnText}>Auto-Detect Calibration</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
            <Text style={styles.btnText}>Proceed to Test ({pixelsPerCm} px/cm)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
    zIndex: 30,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#38BDF8',
  },
  toggleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 30,
  },
  calibrateBtn: {
    backgroundColor: '#FFD600',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  proceedBtn: {
    backgroundColor: '#00E676',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 16,
  },
});
