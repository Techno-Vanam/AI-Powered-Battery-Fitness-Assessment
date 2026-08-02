/**
 * Vertical Jump Test Screen
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useVerticalJump } from '../hooks/useVerticalJump';
import { usePoseProcessor } from '../hooks/usePoseProcessor';
import { JumpCameraView } from '../components/JumpCameraView';
import { LiveSkeletonOverlay } from '../components/LiveSkeletonOverlay';
import { JumpMetricsHUD } from '../components/JumpMetricsHUD';
import { JumpValidationService } from '../services/jumpValidationService';

interface Props {
  navigation: any;
  route: any;
}

export const VerticalJumpScreen: React.FC<Props> = ({ navigation, route }) => {
  const { pixelsPerCm = 10.0 } = route.params || {};
  const { width, height } = useWindowDimensions();

  const { currentPose, onFrameProcessed } = usePoseProcessor();
  const {
    jumpState,
    standingReachPixels,
    highestReachPixels,
    metrics,
    countdownSeconds,
    captureStandingReach,
    startCountdown,
    processFrame,
    resetTest,
  } = useVerticalJump(pixelsPerCm);

  const validatorRef = useRef(new JumpValidationService());
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);

  useEffect(() => {
    if (!currentPose) return;

    // Validate quality
    const warning = validatorRef.current.validateFrame(currentPose, true, 'vertical');
    setWarningMessage(warning ? warning.message : null);

    // Process frame metrics
    processFrame(currentPose, height);
  }, [currentPose, height, processFrame]);

  // When complete, navigate to result screen
  useEffect(() => {
    if (jumpState === 'COMPLETE' && metrics) {
      navigation.replace('JumpResult', {
        testType: 'vertical',
        metrics,
      });
    }
  }, [jumpState, metrics, navigation]);

  const standingReachCm = standingReachPixels
    ? Number((standingReachPixels / pixelsPerCm).toFixed(1))
    : undefined;
  const highestReachCm = highestReachPixels
    ? Number((highestReachPixels / pixelsPerCm).toFixed(1))
    : undefined;

  return (
    <View style={styles.container}>
      <JumpCameraView onFrameProcessed={onFrameProcessed} testType="vertical" />
      <LiveSkeletonOverlay pose={currentPose} width={width} height={height} />

      <JumpMetricsHUD
        jumpState={jumpState}
        countdownSeconds={countdownSeconds}
        standingReachCm={standingReachCm}
        highestReachCm={highestReachCm}
        warningMessage={warningMessage}
      />

      {/* Action Floating Buttons */}
      <View style={styles.controlPanel}>
        {jumpState === 'IDLE' ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => currentPose && captureStandingReach(currentPose, height)}
          >
            <Text style={styles.btnText}>Step 1: Capture Standing Reach</Text>
          </TouchableOpacity>
        ) : null}

        {jumpState === 'READY' ? (
          <TouchableOpacity style={styles.startBtn} onPress={startCountdown}>
            <Text style={styles.btnText}>Step 2: Start 3s Countdown & Jump</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.resetBtn} onPress={resetTest}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  controlPanel: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    zIndex: 30,
    gap: 10,
  },
  actionBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtn: {
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
  resetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resetText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
