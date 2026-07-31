import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCamera } from '@hooks/useCamera';
import { usePermissions } from '@hooks/usePermissions';
import { PermissionGate } from '@components/PermissionGate';
import { usePose } from '@hooks/usePose';
import { useHeightCalculation } from '@hooks/useHeightCalculation';
import { ArucoOverlay } from '@vision/aruco/ArucoOverlay';
import { HeightGuidanceOverlay } from '@height/HeightGuidanceOverlay';
import { PerformanceOverlay } from '@components/PerformanceOverlay';
import type { RootStackParamList } from '@types/camera';
import { HeightTestUseCases } from '../domain/usecases/HeightTestUseCases';
import { Athlete } from '../database/repositories/AthleteRepository';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export function CameraScreen({ navigation, route }: Props) {
  const athlete: Athlete | null =
    (route.params && 'athlete' in route.params ? route.params.athlete : null) ?? null;

  const { isCameraReady, isChecking, isBlocked, requestPermissions, openAppSettings } =
    usePermissions();

  const { config } = useCamera();
  const [isSaving, setIsSaving] = useState(false);
  const isNavigatingRef = useRef(false);

  const frameW = config.format?.videoWidth ?? 1280;
  const frameH = config.format?.videoHeight ?? 720;

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  // Save measurement function (called automatically when countdown finishes)
  const handleSaveMeasurement = useCallback(async () => {
    if (isSaving || isNavigatingRef.current) return;

    if (!athlete) {
      Alert.alert('No Athlete Selected', 'Please select an athlete before measuring height.', [
        {
          text: 'Select Athlete',
          onPress: () => navigation.navigate('AthleteList', { selectForTest: true }),
        },
        { text: 'Cancel' },
      ]);
      return;
    }

    if (!heightState.measurement) return;

    isNavigatingRef.current = true;
    setIsSaving(true);

    try {
      const finalHeightCm = heightState.smoothed?.heightCm ?? heightState.measurement.heightCm;
      const m = heightState.measurement;

      const record = await HeightTestUseCases.saveMeasurement({
        athleteId: athlete.id,
        heightCm: Number(finalHeightCm.toFixed(1)),
        heightPixels: m.heightPixels,
        markerScale: m.markerScale,
        markerConfidence: m.markerConfidence,
        poseConfidence: m.poseConfidence,
        overallConfidence: m.overallConfidence,
        deviceId: 'device-camera-1',
      });

      navigation.replace('HeightResult', {
        athlete,
        heightCm: Number(finalHeightCm.toFixed(1)),
        confidence: m.overallConfidence,
        markerScale: m.markerScale,
        markerConfidence: m.markerConfidence,
        poseConfidence: m.poseConfidence,
        timestamp: record.createdAt,
        testId: record.id,
      });
    } catch (e: any) {
      isNavigatingRef.current = false;
      setIsSaving(false);
      Alert.alert('Error Saving Test', e.message ?? 'Failed to store height test locally');
    }
  }, [athlete, navigation, isSaving]);

  // ── Height engine with Auto-Capture ──────────────────────────────────────
  const { state: heightState, onArucoResult, onPoseResult, poseResult } =
    useHeightCalculation(frameW, frameH, handleSaveMeasurement);

  // ── Combined frame processor (ArUco + Pose) ────────────────────────────────
  const frameProcessor = usePose(onArucoResult, onPoseResult);

  // ── Permission gate ────────────────────────────────────────────────────────
  if (!isCameraReady) {
    return (
      <PermissionGate
        isChecking={isChecking}
        isBlocked={isBlocked}
        onRetry={requestPermissions}
        onOpenSettings={openAppSettings}
      />
    );
  }

  if (config.error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Camera Unavailable</Text>
        <Text style={styles.errorMessage}>{config.error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!config.isReady || !config.device) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.errorMessage}>Initializing camera…</Text>
      </SafeAreaView>
    );
  }

  const arucoResult = heightState.measurement
    ? {
        detected: true as const,
        markerId: 0,
        markerWidthPixels: 0,
        markerHeightPixels: 0,
        markerCenter: { x: 0, y: 0 },
        rotationAngle: 0,
        cmPerPixel: heightState.measurement.markerScale,
        confidence: heightState.measurement.markerConfidence,
        corners: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ] as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }],
      }
    : { detected: false as const, reason: 'MARKER_NOT_FOUND' as const };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Camera preview */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={config.device}
        format={config.format}
        isActive
        frameProcessor={frameProcessor}
        fps={30}
        pixelFormat="yuv"
        enableZoomGesture={false}
        photo={false}
        video={false}
        audio={false}
      />

      {/* ArUco polygon overlay */}
      <ArucoOverlay result={arucoResult} frameWidth={frameW} frameHeight={frameH} />

      {/* Intelligent Guidance System Overlay (Guide Rect, Feet Guides, Marker Guide, Skeleton, Laser Line, Countdown) */}
      <HeightGuidanceOverlay
        heightState={heightState}
        guidanceState={heightState.guidance}
        poseResult={poseResult}
      />

      {/* Real-time Performance & Latency Monitor */}
      <PerformanceOverlay />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.topTitleBox}>
          <Text style={styles.screenTitle}>
            {athlete ? `Measuring: ${athlete.name}` : 'Intelligent Height Measurement'}
          </Text>
          {athlete && <Text style={styles.athleteTag}>ID: {athlete.id}</Text>}
        </View>
        <View style={styles.backBtn} />
      </SafeAreaView>

      {/* Bottom Real-time Auto-Capture Status Bar */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              heightState.guidance.allPassed ? styles.dotGreen : styles.dotAmber,
            ]}
          />
          <Text style={styles.statusText}>
            {heightState.guidance.allPassed
              ? heightState.guidance.countdown !== null
                ? `Hold still... Auto measuring in ${heightState.guidance.countdown}s`
                : 'All Conditions Satisfied!'
              : heightState.guidance.primaryMessage}
          </Text>
        </View>
        <Text style={styles.autoCaptureHint}>
          ⚡ Hands-Free Auto Capture Enabled
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  topTitleBox: { alignItems: 'center' },
  screenTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  athleteTag: { color: '#60a5fa', fontSize: 12, fontWeight: '600' },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
    backgroundColor: 'rgba(0,0,0,0.80)',
    gap: 6,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  dotGreen: { backgroundColor: '#22c55e' },
  dotAmber: { backgroundColor: '#f59e0b' },
  statusText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  autoCaptureHint: { color: '#9ca3af', fontSize: 12, fontWeight: '500' },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  errorIcon: { fontSize: 48 },
  errorTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  errorMessage: { color: '#9ca3af', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  backButton: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
