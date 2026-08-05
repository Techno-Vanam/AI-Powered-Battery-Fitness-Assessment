import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useHeightMeasurement } from '@hooks/useHeightMeasurement';
import { PermissionGate } from '@components/PermissionGate';
import { HeightCaptureOverlay } from '@height/components/HeightCaptureOverlay';
import { useHeightFrameProcessor } from '@height/hooks/useHeightFrameProcessor';
import type { RootStackParamList } from '@app-types/camera';
import { HeightTestUseCases } from '../domain/usecases/HeightTestUseCases';
import type { Athlete } from '../database/repositories/AthleteRepository';
import { LOW_CONFIDENCE_THRESHOLD, MAX_VIDEO_DURATION_SEC } from '@height/config/heightTestConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export function CameraScreen({ navigation, route }: Props) {
  const athlete: Athlete | null =
    (route.params && 'athlete' in route.params ? route.params.athlete : null) ?? null;

  const { isCameraReady, isChecking, isBlocked, requestPermissions, openAppSettings } =
    usePermissions();
  const { config } = useCamera();
  const cameraRef = useRef<Camera>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoStopTriggered = useRef(false);
  const isNavigatingRef = useRef(false);

  const {
    status,
    result,
    errorMessage,
    attempts,
    markerSizeCm,
    startRecording,
    stopRecording,
    resetForRetry,
    isRecording,
    isProcessing,
    recordingDurationSec,
    minDurationSec,
    maxDurationSec,
  } = useHeightMeasurement({
    onLowConfidence: () => {
      // UI handled on result screen — attempts preserved in hook state
    },
  });

  const {
    frameProcessor,
    codeScanner,
    isModelLoaded,
    isModelLoading,
    modelError,
    useNativeAruco,
    useQrFallback,
  } = useHeightFrameProcessor({
    enabled: isRecording && !isProcessing && !isSaving,
    onInferenceError: msg => {
      if (__DEV__) console.warn('[HeightFrameProcessor]', msg);
    },
  });

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const saveAndNavigate = useCallback(
    async (pipelineResult: NonNullable<typeof result>) => {
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

      isNavigatingRef.current = true;
      setIsSaving(true);

      try {
        await HeightTestUseCases.saveMeasurement({
          measurementId: pipelineResult.measurementId,
          athleteId: athlete.id,
          heightCm: pipelineResult.heightCm,
          confidence: pipelineResult.confidence,
          deviceModel: pipelineResult.deviceModel,
          timestamp: pipelineResult.timestamp,
          calibrationMethod: pipelineResult.calibrationMethod,
          teamId: null,
          sessionId: null,
          stableFrameCount: pipelineResult.stableFrameCount,
          videoDurationSec: pipelineResult.videoDurationSec,
          pixelsPerCm: pipelineResult.pixelsPerCm,
        }, athlete);

        navigation.replace('HeightResult', {
          athlete,
          measurementId: pipelineResult.measurementId,
          heightCm: pipelineResult.heightCm,
          confidence: pipelineResult.confidence,
          timestamp: pipelineResult.timestamp,
          attemptCount: attempts.length,
          canRetry: pipelineResult.confidence < LOW_CONFIDENCE_THRESHOLD,
        });
      } catch {
        isNavigatingRef.current = false;
        Alert.alert('Save Failed', 'Could not save measurement locally. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [athlete, attempts.length, isSaving, navigation],
  );

  useEffect(() => {
    if (!isRecording || autoStopTriggered.current) return;
    if (recordingDurationSec >= MAX_VIDEO_DURATION_SEC) {
      autoStopTriggered.current = true;
      void (async () => {
        const pipelineResult = await stopRecording();
        if (pipelineResult) await saveAndNavigate(pipelineResult);
      })();
    }
  }, [isRecording, recordingDurationSec, stopRecording, saveAndNavigate]);

  const handleRecordToggle = useCallback(async () => {
    if (isProcessing || isSaving) return;

    if (isRecording) {
      autoStopTriggered.current = false;
      const pipelineResult = await stopRecording();
      if (pipelineResult) {
        await saveAndNavigate(pipelineResult);
      }
      return;
    }

    autoStopTriggered.current = false;
    resetForRetry();
    startRecording();
  }, [isProcessing, isSaving, isRecording, stopRecording, saveAndNavigate, resetForRetry, startRecording]);

  const handleRetry = useCallback(() => {
    resetForRetry();
    autoStopTriggered.current = false;
  }, [resetForRetry]);

  if (isChecking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!isCameraReady || isBlocked) {
    return (
      <PermissionGate
        isChecking={false}
        onRetry={requestPermissions}
        onOpenSettings={openAppSettings}
        isBlocked={isBlocked}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {config.device && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={config.device}
          format={config.format}
          isActive={!isProcessing && !isSaving}
          video
          audio={false}
          frameProcessor={isModelLoaded ? frameProcessor : undefined}
          codeScanner={useQrFallback || !useNativeAruco ? codeScanner : undefined}
        />
      )}

      {(isModelLoading || modelError) && (
        <View style={styles.modelBanner}>
          <Text style={styles.modelBannerText}>
            {isModelLoading
              ? 'Loading pose model…'
              : 'Pose model unavailable — frame inference disabled'}
          </Text>
        </View>
      )}

      <HeightCaptureOverlay
        status={status}
        recordingDurationSec={recordingDurationSec}
        minDurationSec={minDurationSec}
        maxDurationSec={maxDurationSec}
        markerSizeCm={markerSizeCm}
        confidence={result?.confidence}
        heightCm={result?.heightCm}
        errorMessage={errorMessage}
      />

      <View style={styles.controls}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {attempts.length > 0 && status === 'idle' && (
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryText}>New attempt ({attempts.length} saved)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.recordBtn,
            isRecording && styles.recordBtnActive,
            (isProcessing || isSaving) && styles.recordBtnDisabled,
          ]}
          onPress={handleRecordToggle}
          disabled={isProcessing || isSaving}
        >
          {isProcessing || isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.recordText}>
              {isRecording ? 'Stop & Measure' : 'Start Recording'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  controls: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    gap: 10,
  },
  backBtn: { alignSelf: 'flex-start', padding: 8 },
  backText: { color: '#fff', fontSize: 16 },
  retryBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontSize: 13 },
  recordBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  recordBtnActive: { backgroundColor: '#dc2626' },
  recordBtnDisabled: { opacity: 0.6 },
  recordText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  modelBanner: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 10,
    borderRadius: 8,
  },
  modelBannerText: { color: '#fbbf24', fontSize: 13, textAlign: 'center' },
});
