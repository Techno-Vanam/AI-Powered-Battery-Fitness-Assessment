import { requireNativeComponent, ViewStyle } from 'react-native';
import React from 'react';

type Landmark = { x: number; y: number; score: number };

type Props = {
  style?: ViewStyle;
  onPose?: (event: { nativeEvent: { landmarks: Landmark[]; detected?: boolean } }) => void;
  onCameraState?: (event: { nativeEvent: { state: string; message: string } }) => void;
}

const NativeCameraView = requireNativeComponent<Props>('NativeCameraView');

export default NativeCameraView;
