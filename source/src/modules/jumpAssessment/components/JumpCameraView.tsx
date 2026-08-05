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

interface Props {
  onFrameProcessed: (pose: FramePoseData) => void;
  testType: 'vertical' | 'broad';
}

export const JumpCameraView: React.FC<Props> = ({ onFrameProcessed }) => {
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
    const interval = setInterval(() => {
      onFrameProcessedRef.current({
        timestampMs: Date.now(),
        confidenceScore: 0.95,
        personDetected: true,
        feetVisible: true,
        handsVisible: true,
        landmarks: {
          0:  { x: 0.50, y: 0.20, visibility: 0.99 },
          1:  { x: 0.45, y: 0.30, visibility: 0.98 },
          2:  { x: 0.55, y: 0.30, visibility: 0.98 },
          3:  { x: 0.40, y: 0.40, visibility: 0.95 },
          4:  { x: 0.60, y: 0.40, visibility: 0.95 },
          5:  { x: 0.38, y: 0.25, visibility: 0.92 },
          6:  { x: 0.62, y: 0.25, visibility: 0.92 },
          7:  { x: 0.37, y: 0.20, visibility: 0.90 },
          8:  { x: 0.63, y: 0.20, visibility: 0.90 },
          9:  { x: 0.46, y: 0.55, visibility: 0.97 },
          10: { x: 0.54, y: 0.55, visibility: 0.97 },
          11: { x: 0.45, y: 0.70, visibility: 0.96 },
          12: { x: 0.55, y: 0.70, visibility: 0.96 },
          13: { x: 0.45, y: 0.85, visibility: 0.95 },
          14: { x: 0.55, y: 0.85, visibility: 0.95 },
          15: { x: 0.44, y: 0.88, visibility: 0.93 },
          16: { x: 0.56, y: 0.88, visibility: 0.93 },
        },
      });
    }, 40);
    return () => clearInterval(interval);
  }, [hasPermission, isFocused, isCameraReady]);

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
