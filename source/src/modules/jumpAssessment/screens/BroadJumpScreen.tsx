/**
 * Broad Jump Test Screen
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bottomInsetPadding } from '../../../theme';
import { useBroadJump } from '../hooks/useBroadJump';
import { usePoseProcessor } from '../hooks/usePoseProcessor';
import { JumpCameraView } from '../components/JumpCameraView';
import { LiveSkeletonOverlay } from '../components/LiveSkeletonOverlay';
import { TakeoffLineOverlay } from '../components/TakeoffLineOverlay';
import { JumpMetricsHUD } from '../components/JumpMetricsHUD';
import { JumpValidationService } from '../services/jumpValidationService';

interface Props {
  navigation: any;
  route: any;
}

export const BroadJumpScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { pixelsPerCm = 10.0 } = route.params || {};
  const { width, height } = useWindowDimensions();

  const { currentPose, onFrameProcessed } = usePoseProcessor();
  const {
    jumpState,
    takeoffLineX,
    landingHeelX,
    metrics,
    countdownSeconds,
    captureTakeoffLine,
    startCountdown,
    processFrame,
    resetTest,
  } = useBroadJump(pixelsPerCm);

  const validatorRef = useRef(new JumpValidationService());
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);

  useEffect(() => {
    if (!currentPose) return;

    const warning = validatorRef.current.validateFrame(currentPose, true, 'broad');
    setWarningMessage(warning ? warning.message : null);

    processFrame(currentPose, width);
  }, [currentPose, width, processFrame]);

  useEffect(() => {
    if (jumpState === 'COMPLETE' && metrics) {
      navigation.replace('JumpResult', {
        testType: 'broad',
        metrics,
      });
    }
  }, [jumpState, metrics, navigation]);

  const broadJumpDistanceCm = metrics
    ? metrics.broadJumpDistanceCm
    : takeoffLineX !== null && landingHeelX !== null
    ? Number((Math.abs(landingHeelX - takeoffLineX) / pixelsPerCm).toFixed(1))
    : undefined;

  return (
    <View style={styles.container}>
      <JumpCameraView onFrameProcessed={onFrameProcessed} testType="broad" />
      <LiveSkeletonOverlay pose={currentPose} width={width} height={height} />
      <TakeoffLineOverlay takeoffLineX={takeoffLineX} landingHeelX={landingHeelX} width={width} />

      <JumpMetricsHUD
        jumpState={jumpState}
        countdownSeconds={countdownSeconds}
        broadJumpDistanceCm={broadJumpDistanceCm}
        warningMessage={warningMessage}
        topInset={insets.top}
      />

      <View style={[styles.controlPanel, { bottom: bottomInsetPadding(insets.bottom, 16) + 74 }]}>
        {jumpState === 'IDLE' ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => currentPose && captureTakeoffLine(currentPose, width)}
          >
            <Text style={styles.btnText}>Step 1: Set Takeoff Line Behind Feet</Text>
          </TouchableOpacity>
        ) : null}

        {jumpState === 'READY' ? (
          <TouchableOpacity style={styles.startBtn} onPress={startCountdown}>
            <Text style={styles.btnText}>Step 2: Start 3s Countdown & Broad Jump</Text>
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
