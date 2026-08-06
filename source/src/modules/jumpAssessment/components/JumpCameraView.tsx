/**
 * JumpCameraView — VisionCamera v5 camera preview component.
 *
 * Key fix: VisionCamera v5's `useCamera` hook throws when `device="back"` is passed
 * as a string and `useCameraDevices()` hasn't loaded yet. We must use `useCameraDevice('back')`
 * and only render `<Camera>` after the device is resolved.
 *
 * Permissions: MUST use VisionCamera's own `useCameraPermission()`, NOT PermissionsAndroid.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import type { FramePoseData } from '../types/pose';
import type { JumpState } from '../types/jump';

interface Props {
  onFrameProcessed: (pose: FramePoseData) => void;
  testType: 'vertical' | 'broad';
  /** When provided, mock pose animates during live jump phases. */
  jumpState?: JumpState;
}

function buildMockPose(jumpState: JumpState | undefined, tick: number): FramePoseData {
  const baseY = 0.55;
  let lift = 0;
  if (jumpState === 'TAKEOFF') lift = 0.04;
  if (jumpState === 'AIRBORNE' || jumpState === 'PEAK') lift = 0.12 + Math.sin(tick * 0.15) * 0.02;
  if (jumpState === 'LANDING') lift = 0.05;
  if (jumpState === 'COMPLETE') lift = 0;

  const y = (idx: number) => {
    const offsets: Record<number, number> = {
      0: -0.35, 1: -0.25, 2: -0.25, 3: -0.15, 4: -0.15,
      5: -0.05, 6: -0.05, 7: 0, 8: 0, 9: 0.05, 10: 0.05,
      11: 0.2, 12: 0.2, 13: 0.35, 14: 0.35, 15: 0.38, 16: 0.38,
    };
    return Math.max(0.05, Math.min(0.95, baseY + (offsets[idx] ?? 0) - lift));
  };

  const landmarks = {} as FramePoseData['landmarks'];
  for (let i = 0; i <= 16; i++) {
    landmarks[i as keyof FramePoseData['landmarks']] = {
      x: 0.5 + (i % 2 === 0 ? -0.05 : 0.05),
      y: y(i),
      visibility: 0.95,
    };
  }

  return {
    timestampMs: Date.now(),
    confidenceScore: 0.95,
    personDetected: true,
    feetVisible: jumpState !== 'AIRBORNE' && jumpState !== 'PEAK',
    handsVisible: true,
    landmarks,
  };
}

export const JumpCameraView: React.FC<Props> = ({ onFrameProcessed, jumpState }) => {
  const isFocused = useIsFocused();

  // VisionCamera v5 permission — must NOT use PermissionsAndroid
  const { hasPermission, requestPermission } = useCameraPermission();

  // Resolve back camera device (returns undefined while devices load)
  const device = useCameraDevice('back');

  // Delay camera activation 400ms after focus so the Android Camera2 daemon can
  // fully release any previous session (avoids CAMERA_IN_USE / black screen).
  const [isCameraReady, setIsCameraReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isFocused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsCameraReady(false);
      return;
    }
    timerRef.current = setTimeout(() => setIsCameraReady(true), 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsCameraReady(false);
    };
  }, [isFocused]);

  // Debug log
  useEffect(() => {
    console.log('[JumpCameraView]', {
      hasPermission,
      device: device?.name ?? 'none',
      isFocused,
      isCameraReady,
    });
  }, [hasPermission, device, isFocused, isCameraReady]);

  // Simulated 25 FPS pose stream (replace with real frame processor when ML model is ready)
  const onFrameProcessedRef = useRef(onFrameProcessed);
  useEffect(() => { onFrameProcessedRef.current = onFrameProcessed; }, [onFrameProcessed]);

  useEffect(() => {
    if (!hasPermission || !isFocused || !isCameraReady) return;
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      onFrameProcessedRef.current(buildMockPose(jumpState, tick));
    }, 40);
    return () => clearInterval(interval);
  }, [hasPermission, isFocused, isCameraReady, jumpState]);

  const handleRequestPermission = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  // ── Permission gate ──────────────────────────────────────────────────────────
  if (!hasPermission) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.permTitle}>📷 Camera Permission Required</Text>
        <Text style={styles.permSubtitle}>
          Camera access is needed to analyse your jump posture and calculate
          metrics offline. No video is stored.
        </Text>
        <TouchableOpacity
          style={styles.permBtn}
          onPress={handleRequestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.permBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Camera device not yet resolved ───────────────────────────────────────────
  if (!device || !isCameraReady) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.waitText}>
          {!device ? 'Locating back camera…' : 'Preparing camera…'}
        </Text>
      </View>
    );
  }

  // ── Active camera preview ────────────────────────────────────────────────────
  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && isCameraReady}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    zIndex: 50,
  },
  permTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  permSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  permBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  permBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  waitText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 16,
  },
});
