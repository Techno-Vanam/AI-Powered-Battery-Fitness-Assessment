import { useCallback, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { NitroModules } from 'react-native-nitro-modules';
import {
  useFrameProcessor,
  useCodeScanner,
  VisionCameraProxy,
  type Code,
} from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-reanimated';
import { useRunOnJS } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import {
  MOVENET_INPUT_SIZE,
  POSE_INFERENCE_INTERVAL_MS,
} from '../detection/poseConstants';
import { keypointsToPosePixels, parseMoveNetOutput } from '../detection/movenetPostprocess';
import { frameCaptureBuffer } from '../detection/FrameCaptureBuffer';
import { captureNativeAruco, captureQrMarker } from '../detection/LiveMarkerDetector';

const detectArucoPlugin = VisionCameraProxy.initFrameProcessorPlugin('detectAruco', {});

const MOVENET_MODEL = require('../../../assets/models/movenet_lightning.tflite');
const NATIVE_ARUCO_ENABLED = Platform.OS === 'android';

export interface UseHeightFrameProcessorOptions {
  enabled: boolean;
  onInferenceError?: (message: string) => void;
}

export function useHeightFrameProcessor(options: UseHeightFrameProcessorOptions) {
  const movenet = useTensorflowModel(MOVENET_MODEL);
  const model = movenet.state === 'loaded' ? movenet.model : undefined;
  const { resize } = useResizePlugin();

  const boxedModel = useMemo(
    () => (model != null ? NitroModules.box(model) : undefined),
    [model],
  );

  const isActive = useSharedValue(false);
  const lastInferenceMs = useSharedValue(0);

  useEffect(() => {
    isActive.value = options.enabled;
  }, [options.enabled, isActive]);

  const pushPose = useRunOnJS(
    useCallback(
      (vertexY: number, heelY: number, visibility: number, timestampMs: number) => {
        const frameIndex = frameCaptureBuffer.nextFrameIndex();
        frameCaptureBuffer.addPose({
          vertexY,
          heelY,
          visibility,
          frameIndex,
          timestampMs,
        });
      },
      [],
    ),
    [],
  );

  const pushNativeAruco = useRunOnJS(
    useCallback((raw: Record<string, unknown>) => {
      captureNativeAruco(raw, frameCaptureBuffer.frameCount);
    }, []),
    [],
  );

  const { onInferenceError } = options;
  const reportError = useRunOnJS(
    useCallback(
      (message: string) => {
        onInferenceError?.(message);
      },
      [onInferenceError],
    ),
    [onInferenceError],
  );

  const frameProcessor = useFrameProcessor(
    (frame: any) => {
      'worklet';

      if (!isActive.value || boxedModel == null) return;

      const nowMs = frame.timestamp / 1_000_000;
      if (nowMs - lastInferenceMs.value < POSE_INFERENCE_INTERVAL_MS) return;
      lastInferenceMs.value = nowMs;

      const timestampMs = Math.round(nowMs);

      try {
        const tflite = boxedModel.unbox();

        const resized = resize(frame, {
          scale: { width: MOVENET_INPUT_SIZE, height: MOVENET_INPUT_SIZE },
          pixelFormat: 'rgb',
          dataType: 'uint8',
        });

        const inputBuffer = resized.buffer.slice(
          resized.byteOffset,
          resized.byteOffset + resized.byteLength,
        );

        const outputs = tflite.runSync([inputBuffer]);
        const outputBuffer = outputs[0];
        if (outputBuffer == null) return;

        const keypoints = parseMoveNetOutput(outputBuffer);
        const pixels = keypointsToPosePixels(keypoints, frame.width, frame.height);
        if (pixels == null) return;

        pushPose(pixels.vertexY, pixels.heelY, pixels.visibility, timestampMs);

        if (NATIVE_ARUCO_ENABLED && detectArucoPlugin != null) {
          const arucoRaw = detectArucoPlugin.call(frame) as Record<string, unknown>;
          pushNativeAruco(arucoRaw);
        }
      } catch (e) {
        reportError(e instanceof Error ? e.message : 'Pose inference failed');
      }
    },
    [boxedModel, isActive, lastInferenceMs, pushPose, pushNativeAruco, reportError, resize],
  );

  const handleQrCodes = useCallback(
    (codes: Code[]) => {
      if (!options.enabled || codes.length === 0) return;

      for (const code of codes) {
        if (code.type !== 'qr' || !code.value) continue;

        const corners =
          code.corners?.map((c: any) => ({ x: c.x, y: c.y })) ??
          (code.frame
            ? [
                { x: code.frame.x, y: code.frame.y },
                { x: code.frame.x + code.frame.width, y: code.frame.y },
                {
                  x: code.frame.x + code.frame.width,
                  y: code.frame.y + code.frame.height,
                },
                { x: code.frame.x, y: code.frame.y + code.frame.height },
              ]
            : []);

        if (corners.length < 4) continue;

        captureQrMarker({
          value: code.value,
          corners,
          frameIndex: frameCaptureBuffer.frameCount,
        });
      }
    },
    [options.enabled],
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes: any) => {
      handleQrCodes(codes);
    },
  });

  return {
    frameProcessor,
    codeScanner,
    isModelLoaded: movenet.state === 'loaded',
    isModelLoading: movenet.state === 'loading',
    modelError: movenet.state === 'error' ? movenet.error : null,
    useNativeAruco: NATIVE_ARUCO_ENABLED,
    useQrFallback: Platform.OS === 'ios',
  };
}
