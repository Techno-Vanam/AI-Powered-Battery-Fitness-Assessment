/**
 * JumpFrameAnalysisScreen — Airtime Flight-Time Jump Assessment
 *
 * Flow:
 *  1. User picks a source: Record live video OR import from gallery
 *  2. If recording: VisionCamera previews + records to temp file on device
 *  3. Video plays back in react-native-video with a precision seek slider
 *  4. User uses micro-step buttons to frame-seek to exact takeoff and landing moments
 *  5. H = (g × t²) / 8 is computed live once both markers are set
 *  6. Result is confirmed and passed to JumpResultScreen
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import Video, { type VideoRef } from 'react-native-video';
import { flightTimeEngine } from '../services/flightTimeEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

type AppScreen = 'source_picker' | 'recording' | 'analysis';
type PlaybackSpeed = 1.0 | 0.5 | 0.25;

interface Props {
  navigation: any;
  route: any;
}

export const JumpFrameAnalysisScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { testType = 'vertical' } = route.params || {};
  const isFocused = useIsFocused();

  // ── Screen state ────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<AppScreen>('source_picker');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // ── Recording state ──────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<Camera>(null);

  // ── Playback state ───────────────────────────────────────────────────────────
  const [videoDurationMs, setVideoDurationMs] = useState<number>(0);
  const [currentPositionMs, setCurrentPositionMs] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  const videoRef = useRef<VideoRef>(null);

  // ── Marker state ─────────────────────────────────────────────────────────────
  const [takeoffMs, setTakeoffMs] = useState<number | null>(null);
  const [landingMs, setLandingMs] = useState<number | null>(null);

  // ── Athlete body mass (feeds Sayers Peak Power / Relative Power formulas) ──
  const [bodyMassKg, setBodyMassKg] = useState<string>('70');
  const bodyMassKgNum = parseFloat(bodyMassKg) || 70;

  // ── FPS (determines frame step resolution) ──────────────────────────────────
  const [fps, setFps] = useState<30 | 60 | 120 | 240>(60);
  const frameMs = 1000 / fps;

  // Snaps a raw timestamp to the nearest frame boundary for the selected FPS,
  // so a marker is always frame-accurate regardless of how playback got there.
  const quantizeToFrame = useCallback(
    (ms: number): number => {
      const frameIndex = Math.round(ms / frameMs);
      return Math.max(0, Math.min(videoDurationMs, frameIndex * frameMs));
    },
    [frameMs, videoDurationMs],
  );

  // ── VisionCamera hooks (disable audio to eliminate RECORD_AUDIO crash) ──────
  const { hasPermission: hasCamPerm, requestPermission: requestCamPerm } =
    useCameraPermission();
  const device = useCameraDevice('back');
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Camera activation delay — avoids Camera2 session race on Android
  useEffect(() => {
    if (screen !== 'recording' || !isFocused) {
      setIsCameraReady(false);
      return;
    }
    const t = setTimeout(() => setIsCameraReady(true), 400);
    return () => {
      clearTimeout(t);
      setIsCameraReady(false);
    };
  }, [screen, isFocused]);

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const metrics =
    takeoffMs !== null && landingMs !== null && landingMs > takeoffMs
      ? flightTimeEngine.evaluateAirtimeJump(takeoffMs, landingMs, bodyMassKgNum)
      : null;

  // ── Request storage permissions on Android ──────────────────────────────────
  const ensureStoragePermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const sdkInt = Platform.Version as number;

    try {
      if (sdkInt >= 33) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
        return (
          result[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
          PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (e) {
      console.warn('Storage permission error:', e);
      return true; // Fallback attempt
    }
  }, []);

  // ── Pick video from gallery ─────────────────────────────────────────────────
  const handlePickGallery = useCallback(async () => {
    await ensureStoragePermission();

    launchImageLibrary(
      {
        mediaType: 'video',
        videoQuality: 'high',
        selectionLimit: 1,
      },
      (response: any) => {
        if (response.didCancel || !response.assets?.length) return;
        const asset: Asset = response.assets[0];
        if (!asset.uri) return;

        setIsLoadingVideo(true);
        const formattedUri = asset.uri;

        setTakeoffMs(null);
        setLandingMs(null);
        setCurrentPositionMs(0);
        setVideoUri(formattedUri);
        setScreen('analysis');
      },
    );
  }, [ensureStoragePermission]);

  // ── Open recording screen ───────────────────────────────────────────────────
  const handleOpenRecording = useCallback(async () => {
    if (!hasCamPerm) {
      const granted = await requestCamPerm();
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is needed to record jump video.',
        );
        return;
      }
    }
    setScreen('recording');
  }, [hasCamPerm, requestCamPerm]);

  // ── Start Recording ─────────────────────────────────────────────────────────
  const handleStartRecording = useCallback(() => {
    if (!cameraRef.current || !device) return;
    try {
      setIsRecording(true);
      cameraRef.current.startRecording({
        onRecordingFinished: (video) => {
          setIsRecording(false);
          setIsLoadingVideo(true);

          const cleanPath = video.path.startsWith('file://')
            ? video.path
            : `file://${video.path}`;

          // Give native camera daemon 350ms to release before mounting video player
          setTimeout(() => {
            setVideoUri(cleanPath);
            setTakeoffMs(null);
            setLandingMs(null);
            setCurrentPositionMs(0);
            setScreen('analysis');
          }, 350);
        },
        onRecordingError: (error) => {
          setIsRecording(false);
          Alert.alert('Recording Error', error.message);
        },
      });
    } catch (e: any) {
      setIsRecording(false);
      Alert.alert('Recording Error', e.message ?? String(e));
    }
  }, [device]);

  // ── Stop Recording ──────────────────────────────────────────────────────────
  const handleStopRecording = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      await cameraRef.current.stopRecording();
    } catch (e: any) {
      Alert.alert('Stop Error', e.message ?? String(e));
    }
  }, []);

  // ── Frame Stepper ────────────────────────────────────────────────────────────
  const stepFrame = useCallback(
    (deltaFrames: number) => {
      setIsPlaying(false);
      setCurrentPositionMs((prev) => {
        const next = prev + deltaFrames * frameMs;
        return Math.max(0, Math.min(videoDurationMs, next));
      });
    },
    [frameMs, videoDurationMs],
  );

  // Seek video when currentPositionMs changes while paused
  useEffect(() => {
    if (!isPlaying && videoRef.current && videoDurationMs > 0) {
      videoRef.current.seek(currentPositionMs / 1000);
    }
  }, [currentPositionMs, isPlaying, videoDurationMs]);

  // ── Confirm result ────────────────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!metrics) return;
    navigation.navigate('JumpResult', {
      testType,
      method: 'airtime',
      metrics: {
        verticalJumpCm: metrics.jumpHeightCm,
        airtimeMs: metrics.flightTimeMs,
        takeoffVelocityMs: metrics.takeoffVelocityMs,
        peakPowerWatts: metrics.peakPowerWatts,
        relativePowerWkg: metrics.relativePowerWkg,
      },
    });
  }, [metrics, navigation, testType]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Source Picker
  // ═══════════════════════════════════════════════════════════════════════════
  if (screen === 'source_picker') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Airtime Jump Analysis</Text>
        <Text style={styles.pageSubtitle}>
          Record or import a slow-motion jump video. Mark the exact frame when
          feet leave and touch the floor. Height is computed via{' '}
          <Text style={styles.formula}>H = (g × t²) / 8</Text>.
        </Text>

        {/* Record card */}
        <TouchableOpacity
          style={[styles.sourceCard, { borderColor: '#38BDF8' }]}
          activeOpacity={0.8}
          onPress={handleOpenRecording}
        >
          <Text style={styles.sourceCardIcon}>🎥</Text>
          <Text style={styles.sourceCardTitle}>Record Live Video</Text>
          <Text style={styles.sourceCardDesc}>
            Record your jump directly in the app. For best accuracy, hold the
            phone steady at waist level.
          </Text>
        </TouchableOpacity>

        {/* Import card */}
        <TouchableOpacity
          style={[styles.sourceCard, { borderColor: '#00E676' }]}
          activeOpacity={0.8}
          onPress={handlePickGallery}
        >
          <Text style={styles.sourceCardIcon}>📁</Text>
          <Text style={styles.sourceCardTitle}>Import from Gallery</Text>
          <Text style={styles.sourceCardDesc}>
            Select an existing slow-motion video (60 / 120 / 240 FPS) recorded
            with your camera app. Higher FPS = greater precision.
          </Text>
        </TouchableOpacity>

        {/* FPS info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📊 Precision vs. Frame Rate</Text>
          {[
            { fps: '30 FPS', res: '~5.4 cm', time: '33 ms / frame' },
            { fps: '60 FPS', res: '~1.4 cm', time: '16.7 ms / frame' },
            { fps: '120 FPS', res: '~0.4 cm', time: '8.3 ms / frame' },
            { fps: '240 FPS', res: '~0.1 cm', time: '4.2 ms / frame' },
          ].map((row) => (
            <View key={row.fps} style={styles.infoRow}>
              <Text style={styles.infoFps}>{row.fps}</Text>
              <Text style={styles.infoTime}>{row.time}</Text>
              <Text style={styles.infoRes}>±{row.res}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Recording Screen
  // ═══════════════════════════════════════════════════════════════════════════
  if (screen === 'recording') {
    return (
      <View style={styles.container}>
        {/* Camera preview */}
        <View style={styles.recorderPreviewBox}>
          {device && isCameraReady ? (
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isFocused && isCameraReady && screen === 'recording'}
              video
              audio={false}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.recorderLoading}>
              <ActivityIndicator size="large" color="#38BDF8" />
              <Text style={styles.waitText}>Preparing camera…</Text>
            </View>
          )}

          {isRecording && (
            <View style={styles.recBadge}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>REC</Text>
            </View>
          )}
        </View>

        {/* Recording controls */}
        <View style={styles.recControls}>
          <Text style={styles.recHint}>
            {isRecording
              ? 'Recording… press Stop when jump is complete.'
              : 'Press Start to begin recording your jump.'}
          </Text>
          <View style={styles.recBtns}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                if (isRecording) void handleStopRecording();
                setScreen('source_picker');
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            {!isRecording ? (
              <TouchableOpacity
                style={styles.startRecBtn}
                onPress={handleStartRecording}
              >
                <Text style={styles.startRecBtnText}>Start Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.stopRecBtn}
                onPress={handleStopRecording}
              >
                <Text style={styles.stopRecBtnText}>Stop Recording</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: Analysis Screen (video loaded)
  // ═══════════════════════════════════════════════════════════════════════════
  const progressFraction =
    videoDurationMs > 0 ? currentPositionMs / videoDurationMs : 0;
  const currentFrame = Math.round(currentPositionMs / frameMs);
  const totalFrames = Math.round(videoDurationMs / frameMs);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          setVideoUri(null);
          setScreen('source_picker');
        }}
      >
        <Text style={styles.backBtnText}>← Select Different Video</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Frame Analysis</Text>

      {/* ── Video Player ── */}
      {videoUri ? (
        <View style={styles.videoBox}>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            paused={!isPlaying}
            rate={playbackSpeed}
            resizeMode="contain"
            onLoad={(data: any) => {
              setIsLoadingVideo(false);
              setVideoDurationMs(data.duration * 1000);
            }}
            onError={(e: any) => {
              setIsLoadingVideo(false);
              console.error('[VideoPlayer Error]', e);
              Alert.alert(
                'Video Playback Error',
                'Could not load the selected video file.',
              );
            }}
            onProgress={(data: any) => {
              if (isPlaying) {
                setCurrentPositionMs(data.currentTime * 1000);
              }
            }}
            onEnd={() => setIsPlaying(false)}
            onSeek={(data: any) => {
              // Android can snap a seek to the nearest available decode point
              // rather than the exact requested time — trust the reported
              // position so markers always match what's on screen.
              setCurrentPositionMs(data.currentTime * 1000);
            }}
            repeat={false}
          />

          {isLoadingVideo && (
            <View style={styles.videoLoadingOverlay}>
              <ActivityIndicator size="large" color="#38BDF8" />
              <Text style={styles.waitText}>Loading video…</Text>
            </View>
          )}

          {/* Marker overlays on video */}
          {takeoffMs !== null && (
            <View style={[styles.videoBadge, { backgroundColor: '#38BDF8' }]}>
              <Text style={styles.videoBadgeText}>
                Takeoff: {Math.round(takeoffMs)} ms
              </Text>
            </View>
          )}
          {landingMs !== null && (
            <View
              style={[
                styles.videoBadge,
                { bottom: 8, top: undefined, backgroundColor: '#00E676' },
              ]}
            >
              <Text style={styles.videoBadgeText}>
                Landing: {Math.round(landingMs)} ms
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {/* ── Timeline Progress Bar ── */}
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineStat}>
          Frame {currentFrame}/{totalFrames} •{' '}
          {(currentPositionMs / 1000).toFixed(3)}s
        </Text>

        {/* Tappable progress bar */}
        <TouchableOpacity
          style={styles.progressBarTrack}
          activeOpacity={0.9}
          onPress={(e) => {
            const { locationX } = e.nativeEvent;
            const trackWidth = SCREEN_WIDTH - 40;
            const fraction = Math.max(0, Math.min(1, locationX / trackWidth));
            const seekMs = fraction * videoDurationMs;
            setCurrentPositionMs(seekMs);
            setIsPlaying(false);
          }}
        >
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressFraction * 100}%` },
            ]}
          />
          {/* Takeoff marker on timeline */}
          {takeoffMs !== null && videoDurationMs > 0 && (
            <View
              style={[
                styles.timelineMarker,
                {
                  left: `${(takeoffMs / videoDurationMs) * 100}%`,
                  backgroundColor: '#38BDF8',
                },
              ]}
            />
          )}
          {/* Landing marker on timeline */}
          {landingMs !== null && videoDurationMs > 0 && (
            <View
              style={[
                styles.timelineMarker,
                {
                  left: `${(landingMs / videoDurationMs) * 100}%`,
                  backgroundColor: '#00E676',
                },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* ── FPS Selector ── */}
      <View style={styles.fpsRow}>
        <Text style={styles.smallLabel}>Video FPS:</Text>
        {([30, 60, 120, 240] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.fpsBtn, fps === f && styles.fpsBtnActive]}
            onPress={() => setFps(f)}
          >
            <Text
              style={[styles.fpsBtnText, fps === f && styles.fpsBtnTextActive]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Body Mass Input (feeds Peak/Relative Power formulas) ── */}
      <View style={styles.fpsRow}>
        <Text style={styles.smallLabel}>Body Mass (kg):</Text>
        <TextInput
          style={styles.massInput}
          value={bodyMassKg}
          onChangeText={setBodyMassKg}
          keyboardType="numeric"
          placeholder="70"
          placeholderTextColor="#64748B"
        />
      </View>

      {/* ── Playback Controls ── */}
      <View style={styles.controlsCard}>
        <Text style={styles.cardTitle}>Playback Controls</Text>

        {/* Speed selector */}
        <View style={styles.speedRow}>
          <Text style={styles.smallLabel}>Speed:</Text>
          {([0.25, 0.5, 1.0] as PlaybackSpeed[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.speedBtn,
                playbackSpeed === s && styles.speedBtnActive,
              ]}
              onPress={() => setPlaybackSpeed(s)}
            >
              <Text
                style={[
                  styles.speedBtnText,
                  playbackSpeed === s && styles.speedBtnTextActive,
                ]}
              >
                {s}×
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step + Play buttons */}
        <View style={styles.stepperRow}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => stepFrame(-5)}>
            <Text style={styles.stepBtnText}>-5f</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepBtn} onPress={() => stepFrame(-1)}>
            <Text style={styles.stepBtnText}>-1f</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => setIsPlaying((v) => !v)}
          >
            <Text style={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepBtn} onPress={() => stepFrame(1)}>
            <Text style={styles.stepBtnText}>+1f</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepBtn} onPress={() => stepFrame(5)}>
            <Text style={styles.stepBtnText}>+5f</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Marker Buttons ── */}
      <View style={styles.markerCard}>
        <Text style={styles.cardTitle}>Set Markers</Text>
        <Text style={styles.markerHint}>
          Step frame-by-frame to the exact moment, then tap the marker button.
        </Text>
        <View style={styles.markerRow}>
          <TouchableOpacity
            style={[
              styles.markerBtn,
              { borderColor: '#38BDF8' },
              takeoffMs !== null && styles.markerBtnSet,
            ]}
            onPress={() => setTakeoffMs(quantizeToFrame(currentPositionMs))}
          >
            <Text style={styles.markerBtnLabel}>1. Set Takeoff</Text>
            <Text style={styles.markerBtnSub}>
              {takeoffMs !== null
                ? `✓ ${Math.round(takeoffMs)} ms`
                : 'Feet leave the floor'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.markerBtn,
              { borderColor: '#00E676' },
              landingMs !== null && styles.markerBtnSet,
            ]}
            onPress={() => setLandingMs(quantizeToFrame(currentPositionMs))}
          >
            <Text style={styles.markerBtnLabel}>2. Set Landing</Text>
            <Text style={styles.markerBtnSub}>
              {landingMs !== null
                ? `✓ ${Math.round(landingMs)} ms`
                : 'Feet touch the floor'}
            </Text>
          </TouchableOpacity>
        </View>

        {(takeoffMs !== null || landingMs !== null) && (
          <TouchableOpacity
            style={styles.resetMarkersBtn}
            onPress={() => {
              setTakeoffMs(null);
              setLandingMs(null);
            }}
          >
            <Text style={styles.resetMarkersText}>Reset Markers</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Live Results Card ── */}
      {metrics ? (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>🏆 Jump Height Calculated</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Airtime</Text>
              <Text style={styles.metricValue}>{metrics.flightTimeMs} ms</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Jump Height</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: '#00E676', fontSize: 28 },
                ]}
              >
                {metrics.jumpHeightCm} cm
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Takeoff Velocity</Text>
              <Text style={styles.metricValue}>
                {metrics.takeoffVelocityMs} m/s
              </Text>
            </View>
            {metrics.peakPowerWatts ? (
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Peak Power (Sayers)</Text>
                <Text style={styles.metricValue}>
                  {metrics.peakPowerWatts} W
                </Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Save Result →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 Step through the video frame-by-frame using the ±1f / ±5f
            buttons. Set <Text style={{ color: '#38BDF8' }}>Takeoff</Text> at
            the last frame before feet leave the floor, and{' '}
            <Text style={{ color: '#00E676' }}>Landing</Text> at the first
            frame feet make contact. Jump height will appear automatically.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingBottom: 60, gap: 16 },

  backBtn: { marginBottom: 4 },
  backBtnText: { color: '#38BDF8', fontSize: 14, fontWeight: '600' },

  pageTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC' },
  pageSubtitle: { fontSize: 13, color: '#94A3B8', lineHeight: 20 },
  formula: { color: '#38BDF8', fontWeight: '700' },

  // Source picker
  sourceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  sourceCardIcon: { fontSize: 36 },
  sourceCardTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  sourceCardDesc: { fontSize: 13, color: '#94A3B8', lineHeight: 20 },

  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  infoTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoFps: { color: '#38BDF8', fontWeight: '700', width: 72 },
  infoTime: { color: '#94A3B8', fontSize: 12, flex: 1 },
  infoRes: { color: '#00E676', fontWeight: '700', fontSize: 12, textAlign: 'right' },

  // Recording
  recorderPreviewBox: {
    width: SCREEN_WIDTH,
    height: (SCREEN_WIDTH * 4) / 3,
    backgroundColor: '#000',
  },
  recorderLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  waitText: { color: '#94A3B8', fontSize: 14 },
  recBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
  recText: { color: '#EF4444', fontWeight: '800', fontSize: 13 },
  recControls: {
    padding: 24,
    backgroundColor: '#1E293B',
    gap: 16,
  },
  recHint: { color: '#94A3B8', fontSize: 13, textAlign: 'center' },
  recBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#F8FAFC', fontWeight: '700' },
  startRecBtn: {
    flex: 2,
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startRecBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  stopRecBtn: {
    flex: 2,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  stopRecBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Analysis
  videoBox: {
    width: SCREEN_WIDTH - 40,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: { width: '100%', height: '100%' },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  videoBadgeText: { color: '#000', fontWeight: '800', fontSize: 11 },

  timelineContainer: { gap: 8 },
  timelineStat: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  progressBarTrack: {
    height: 20,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 10,
  },
  timelineMarker: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 3,
    borderRadius: 2,
  },

  fpsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  massInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 70,
    fontSize: 13,
  },
  fpsBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  fpsBtnActive: { backgroundColor: '#38BDF8', borderColor: '#38BDF8' },
  fpsBtnText: { color: '#94A3B8', fontWeight: '700', fontSize: 12 },
  fpsBtnTextActive: { color: '#000' },

  controlsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  cardTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 15 },
  speedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  speedBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  speedBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  speedBtnText: { color: '#94A3B8', fontWeight: '700', fontSize: 13 },
  speedBtnTextActive: { color: '#fff' },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  stepBtnText: { color: '#F8FAFC', fontWeight: '800', fontSize: 13 },
  playBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  playBtnText: { color: '#000', fontWeight: '800', fontSize: 18 },

  markerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  markerHint: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },
  markerRow: { flexDirection: 'row', gap: 10 },
  markerBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 4,
  },
  markerBtnSet: { backgroundColor: 'rgba(255,255,255,0.12)' },
  markerBtnLabel: { color: '#F8FAFC', fontWeight: '800', fontSize: 13 },
  markerBtnSub: { color: '#94A3B8', fontSize: 11 },
  resetMarkersBtn: { alignItems: 'center', paddingVertical: 4 },
  resetMarkersText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },

  resultsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#00E676',
    gap: 14,
  },
  resultsTitle: { color: '#00E676', fontSize: 18, fontWeight: '800' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  metricLabel: { color: '#94A3B8', fontSize: 11 },
  metricValue: { color: '#F8FAFC', fontSize: 20, fontWeight: '800' },
  confirmBtn: {
    backgroundColor: '#00E676',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },

  tipCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tipText: { color: '#94A3B8', fontSize: 13, lineHeight: 20 },
});
