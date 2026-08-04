import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { ChevronLeft, Zap, ZapOff, RotateCcw, CheckCircle } from 'lucide-react-native';
import AppText from '../../components/ui/AppText';
import { colors, layout, roleColors } from '../../theme';
import { CameraService } from '../../services/CameraService';
import { useWeightScanner } from '../../services/useWeightScanner';

import ResizableROIOverlay, { ROIRect } from '../../components/ui/ResizableROIOverlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const accent = roleColors('athlete');

const DEFAULT_CROP_RECT: ROIRect = {
  x: (SCREEN_WIDTH - SCREEN_WIDTH * 0.8) / 2,
  y: SCREEN_HEIGHT / 2 - 110,
  width: SCREEN_WIDTH * 0.8,
  height: 140,
};

// ─── Status palette ────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  idle:      { dot: colors.textMuted,   bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', text: colors.textMuted },
  searching: { dot: colors.textMuted,   bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', text: colors.textSecondary },
  reading:   { dot: '#F59E0B',          bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.30)', text: '#F59E0B' },
  stable:    { dot: '#10B981',          bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.40)', text: '#10B981' },
  error:     { dot: colors.error,       bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  text: colors.error },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const LiveWeightScannerScreen = ({ navigation }: any) => {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [currentRoi, setCurrentRoi] = useState<ROIRect>(DEFAULT_CROP_RECT);

  // Scanning state from hook
  const {
    scanState,
    startScanning,
    stopScanning,
    resetScanning,
    updateCropRect,
    REQUIRED_STABLE_FRAMES,
  } = useWeightScanner();

  const handleRoiChange = useCallback(
    (newRect: ROIRect) => {
      setCurrentRoi(newRect);
      updateCropRect(newRect);
    },
    [updateCropRect]
  );

  // ── Animations ──────────────────────────────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stableGlowAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (scanState.status === 'stable') {
      Animated.timing(stableGlowAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      stableGlowAnim.setValue(0);
    }
  }, [scanState.status]);

  // Status dot pulse
  useEffect(() => {
    pulseLoop.current?.stop();
    if (scanState.status !== 'stable') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
        ]),
      );
      pulseLoop.current = loop;
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => pulseLoop.current?.stop();
  }, [scanState.status]);

  // ── Permission + start scanning ────────────────────────────────────────────
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // Start scanning once camera permission is granted
  useEffect(() => {
    if (hasPermission) {
      const t = setTimeout(() => startScanning(cameraRef, DEFAULT_CROP_RECT), 500);
      return () => clearTimeout(t);
    }
  }, [hasPermission, startScanning]);

  // Trigger initial search state when camera becomes ready
  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  // ── Confirm stable weight ──────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    stopScanning();
    navigation.replace('WeightOCRResult', {
      weight: scanState.stableWeight,
      confidence: scanState.confidence,
      rawText: scanState.rawText,
      imagePath: null,
      recognitionMethod: scanState.method,
    });
  }, [scanState, navigation, stopScanning]);

  // ── Reset / rescan ─────────────────────────────────────────────────────────
  const handleRescan = useCallback(() => {
    resetScanning(cameraRef, currentRoi);
  }, [resetScanning, currentRoi]);

  const handleBack = useCallback(() => {
    stopScanning();
    navigation.goBack();
  }, [stopScanning, navigation]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const palette = STATUS_COLORS[scanState.status];
  const isStable = scanState.status === 'stable';
  const isSearching = scanState.status === 'searching' || scanState.status === 'idle';
  const displayWeight = isStable ? scanState.stableWeight : scanState.currentReading;

  const frameCount = Math.min(scanState.consecutiveFrames, REQUIRED_STABLE_FRAMES);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <AppText variant="h2" style={styles.permText}>Camera Permission Required</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.permSubText}>
          Please allow camera access to scan your weighing scale display.
        </AppText>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <AppText variant="label" color="#fff">Grant Permission</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <AppText variant="h2" style={styles.permText}>No Camera Found</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Camera Preview (full screen) ── */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        torch={isFlashOn ? 'on' : 'off'}
        enableZoomGesture={false}
        onInitialized={handleCameraReady}
      />

      {/* ── Interactive Resizable / Draggable ROI Overlay ── */}
      <ResizableROIOverlay
        initialRect={DEFAULT_CROP_RECT}
        onRectChange={handleRoiChange}
        isStable={isStable}
      />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleBack} activeOpacity={0.8}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.titleWrap}>
          <AppText variant="label" style={styles.titleText}>Weight Scanner</AppText>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setIsFlashOn(f => !f)}
          activeOpacity={0.8}
        >
          {isFlashOn
            ? <Zap size={22} color="#F59E0B" />
            : <ZapOff size={22} color="rgba(255,255,255,0.6)" />
          }
        </TouchableOpacity>
      </View>

      {/* ── Bottom status panel ── */}
      <View style={styles.bottomPanel}>

        {/* Status row */}
        <View style={[styles.statusRow, {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        }]}>
          <Animated.View style={[
            styles.statusDot,
            { backgroundColor: palette.dot, opacity: isStable ? 1 : pulseAnim },
          ]} />
          <AppText variant="label" style={[styles.statusLabel, { color: palette.text }]}>
            {scanState.statusLabel}
          </AppText>
        </View>

        {/* Weight readout */}
        <View style={styles.readoutRow}>
          {displayWeight !== null ? (
            <>
              <AppText variant="h1" style={[styles.weightNumber, {
                color: isStable ? '#10B981' : '#fff',
              }]}>
                {displayWeight}
              </AppText>
              <AppText variant="h3" style={[styles.weightUnit, {
                color: isStable ? '#10B981' : 'rgba(255,255,255,0.6)',
              }]}>
                {' kg'}
              </AppText>
            </>
          ) : (
            <AppText variant="h2" style={styles.weightPlaceholder}>
              {isSearching ? 'Scanning...' : '---'}
            </AppText>
          )}
        </View>

        {/* Stability progress dots */}
        <View style={styles.progressRow}>
          <AppText variant="caption" color="rgba(255,255,255,0.5)" style={styles.progressLabel}>
            Stability
          </AppText>
          <View style={styles.dotRow}>
            {Array.from({ length: REQUIRED_STABLE_FRAMES }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i < frameCount ? { backgroundColor: isStable ? '#10B981' : '#F59E0B' }
                                 : { backgroundColor: 'rgba(255,255,255,0.15)' },
                ]}
              />
            ))}
          </View>
          <AppText variant="caption" color="rgba(255,255,255,0.5)" style={styles.progressCount}>
            {frameCount}/{REQUIRED_STABLE_FRAMES}
          </AppText>
        </View>

        {/* Confidence */}
        {scanState.confidence > 0 && (
          <AppText variant="caption" color="rgba(255,255,255,0.45)" style={styles.confidenceText}>
            OCR confidence {Math.round(scanState.confidence * 100)}%
            {scanState.method !== 'none' ? ` · ${scanState.method === 'seven-segment-native' ? '7-Segment Engine' : 'ML Kit'}` : ''}
          </AppText>
        )}

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          {/* Rescan */}
          {isStable && (
            <TouchableOpacity style={styles.rescanBtn} onPress={handleRescan} activeOpacity={0.85}>
              <RotateCcw size={16} color="rgba(255,255,255,0.7)" />
              <AppText variant="label" color="rgba(255,255,255,0.7)" style={styles.rescanText}>
                Rescan
              </AppText>
            </TouchableOpacity>
          )}

          {/* Confirm */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              isStable ? styles.confirmBtnActive : styles.confirmBtnDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!isStable}
            activeOpacity={0.9}
          >
            <AppText
              variant="label"
              style={[
                styles.confirmBtnText,
                { color: isStable ? '#fff' : 'rgba(255,255,255,0.3)' },
              ]}
            >
              {isStable
                ? `Confirm — ${scanState.stableWeight} kg`
                : 'Detecting weight...'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelBtn} onPress={handleBack} activeOpacity={0.8}>
          <AppText variant="caption" color="rgba(255,255,255,0.4)">
            Cancel
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;
const BOTTOM_PANEL_HEIGHT = 280;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Permission screens
  permissionContainer: {
    flex: 1, backgroundColor: '#0a0a0a',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  permText: { color: '#fff', textAlign: 'center', marginBottom: 12 },
  permSubText: { textAlign: 'center', marginBottom: 32 },
  permButton: {
    backgroundColor: accent.primary, paddingHorizontal: 32,
    paddingVertical: 14, borderRadius: layout.radiusLg,
  },

  // Dark vignette bands
  darkBand: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  darkStrip: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44,
    left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.horizontalPadding,
  },
  iconBtn: {
    width: 42, height: 42,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  titleText: {
    color: '#fff', fontSize: 15, fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Bottom panel
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: BOTTOM_PANEL_HEIGHT,
    backgroundColor: 'rgba(8,8,16,0.92)',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: layout.horizontalPadding + 4,
    paddingTop: 20, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },

  // Status row
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: layout.radiusSm, borderWidth: 1,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 13, fontWeight: '500' },

  // Readout
  readoutRow: {
    flexDirection: 'row', alignItems: 'baseline',
    marginBottom: 14,
  },
  weightNumber: { fontSize: 52, fontWeight: '700', color: '#fff', lineHeight: 58 },
  weightUnit:   { fontSize: 22, fontWeight: '500', lineHeight: 58 },
  weightPlaceholder: {
    fontSize: 32, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', lineHeight: 58,
  },

  // Progress
  progressRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  progressLabel: { fontSize: 11, minWidth: 48 },
  dotRow: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  progressCount: { fontSize: 11 },

  confidenceText: { fontSize: 11, marginBottom: 16 },

  // Buttons
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  confirmBtn: {
    flex: 1, height: 52, borderRadius: layout.radiusLg,
    justifyContent: 'center', alignItems: 'center',
  },
  confirmBtnActive: {
    backgroundColor: accent.primary,
    shadowColor: accent.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
  },
  confirmBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  rescanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, height: 52,
    borderRadius: layout.radiusLg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  rescanText: { fontSize: 13 },
  cancelBtn: { alignSelf: 'center', paddingVertical: 8 },
});

export default LiveWeightScannerScreen;
