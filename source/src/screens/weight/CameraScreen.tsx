import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  Zap,
  ZapOff,
  Camera as CameraIcon,
} from 'lucide-react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import AppText from '../../components/ui/AppText';
import { colors, layout, roleColors } from '../../theme';
import { CameraService } from '../../services/CameraService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const accent = roleColors('athlete');

export const CameraScreen = ({ navigation }: any) => {
  const cameraRef = useRef<any>(null);

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const requestPermission = async () => {
    const ok = await CameraService.requestCameraPermission();
    setHasPermission(ok);
    return ok;
  };

  useEffect(() => {
    requestPermission();
  }, []);

  const handleCaptureInAppPhoto = async () => {
    if (isCapturing) return;

    if (!hasPermission) {
      const ok = await requestPermission();
      if (!ok) {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is required to scan digital weighing scale displays.'
        );
        return;
      }
    }

    if (!cameraRef.current) {
      Alert.alert('Camera Error', 'In-app camera is initializing. Please wait a moment.');
      return;
    }

    setIsCapturing(true);

    try {
      // Capture frame directly from the in-app live camera preview
      const image = await cameraRef.current.capture();
      setIsCapturing(false);

      if (image && image.uri) {
        const fullPath = image.uri.startsWith('file://')
          ? image.uri
          : `file://${image.uri}`;

        const frameDims = CameraService.getLCDCropFrameDimensions(
          SCREEN_WIDTH,
          SCREEN_HEIGHT
        );

        const cropRect = {
          x: Math.round(frameDims.x),
          y: Math.round(frameDims.y),
          width: Math.round(frameDims.width),
          height: Math.round(frameDims.height),
        };

        // Proceed directly to LCD crop & Google ML Kit OCR pipeline
        navigation.replace('WeightOCRProcessing', {
          imagePath: fullPath,
          cropRect,
        });

      } else {
        Alert.alert('Capture Error', 'Could not retrieve captured frame.');
      }
    } catch (err) {
      setIsCapturing(false);
      Alert.alert('Capture Error', 'Failed to capture frame from in-app camera.');
    }
  };

  const frameDims = CameraService.getLCDCropFrameDimensions(
    SCREEN_WIDTH,
    SCREEN_HEIGHT
  );

  return (
    <View style={styles.container}>
      {/* Full-Screen In-App Live Camera Viewfinder */}
      {hasPermission ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          cameraType={CameraType.Back}
          flashMode={flashOn ? 'on' : 'off'}
          focusMode="on"
        />
      ) : (
        <View style={styles.noCameraFallback}>
          <ActivityIndicator color={accent.primary} size="large" />
          <AppText variant="body" color={colors.surface} style={styles.fallbackText}>
            Requesting Camera Permission...
          </AppText>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <AppText variant="button" color={colors.surface}>
              Grant Permission
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* LCD Bounding Frame Alignment Overlay */}
      <View style={styles.viewfinderBackdrop} pointerEvents="none">
        <View style={[styles.overlayTop, { height: frameDims.y }]} />
        <View style={styles.overlayMiddleRow}>
          <View style={{ width: frameDims.x, height: frameDims.height, backgroundColor: colors.overlay }} />
          {/* LCD Guide Rectangle Cutout */}
          <View
            style={[
              styles.targetFrame,
              { width: frameDims.width, height: frameDims.height },
            ]}
          >
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <AppText variant="pill" color={colors.surface} style={styles.lcdBadge}>
              ALIGN WEIGHING SCALE DISPLAY
            </AppText>
          </View>
          <View style={{ width: frameDims.x, height: frameDims.height, backgroundColor: colors.overlay }} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Top Controls Bar */}
      <View style={styles.topControlBar}>
        <TouchableOpacity
          style={styles.controlIconBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ChevronLeft size={layout.iconLg} color={colors.surface} />
        </TouchableOpacity>

        <AppText variant="h3" color={colors.surface}>
          Weight Scanner
        </AppText>

        <TouchableOpacity
          style={styles.controlIconBtn}
          onPress={() => setFlashOn((prev) => !prev)}
          activeOpacity={0.8}
        >
          {flashOn ? (
            <Zap size={layout.iconMd} color="#FBBF24" />
          ) : (
            <ZapOff size={layout.iconMd} color={colors.surface} />
          )}
        </TouchableOpacity>
      </View>

      {/* Alignment Banner Instruction */}
      <View style={styles.instructionBanner} pointerEvents="none">
        <AppText variant="subtitle" color={colors.surface} style={styles.centeredText}>
          Align scale display inside frame & tap Capture
        </AppText>
      </View>

      {/* Bottom Control Bar */}
      <View style={styles.bottomControlBar}>
        <View style={{ width: 44 }} />

        {/* In-App Camera Shutter Capture Button */}
        <TouchableOpacity
          style={styles.shutterOuter}
          onPress={handleCaptureInAppPhoto}
          disabled={isCapturing}
          activeOpacity={0.85}
        >
          <View style={styles.shutterInner}>
            {isCapturing ? (
              <ActivityIndicator color={accent.primary} size="small" />
            ) : (
              <CameraIcon size={layout.iconLg} color={accent.primary} />
            )}
          </View>
        </TouchableOpacity>

        <View style={{ width: 44 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  noCameraFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  fallbackText: {
    textAlign: 'center',
  },
  permBtn: {
    backgroundColor: accent.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: layout.radiusMd,
    marginTop: 10,
  },
  viewfinderBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    width: '100%',
    backgroundColor: colors.overlay,
  },
  overlayMiddleRow: {
    flexDirection: 'row',
  },
  overlayBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.overlay,
  },
  targetFrame: {
    borderColor: accent.primary,
    borderWidth: 2,
    borderRadius: layout.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#38BDF8',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },
  lcdBadge: {
    backgroundColor: accent.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  topControlBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.horizontalPadding,
    zIndex: 10,
  },
  controlIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: layout.radiusLg,
    zIndex: 10,
  },
  centeredText: {
    textAlign: 'center',
  },
  bottomControlBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: layout.horizontalPadding,
    zIndex: 10,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraScreen;
