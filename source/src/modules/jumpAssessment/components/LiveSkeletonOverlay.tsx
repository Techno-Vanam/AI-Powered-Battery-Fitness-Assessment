/**
 * Live Skeleton Overlay Component
 * Renders 17 MediaPipe Pose Landmarks and skeleton bones on top of camera preview.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { FramePoseData, PoseLandmarkIndex } from '../types/pose';

interface Props {
  pose: FramePoseData | null;
  width: number;
  height: number;
}

// Bone connections between MediaPipe landmarks
const BONE_CONNECTIONS: [PoseLandmarkIndex, PoseLandmarkIndex][] = [
  [PoseLandmarkIndex.LEFT_SHOULDER, PoseLandmarkIndex.RIGHT_SHOULDER],
  [PoseLandmarkIndex.LEFT_SHOULDER, PoseLandmarkIndex.LEFT_ELBOW],
  [PoseLandmarkIndex.LEFT_ELBOW, PoseLandmarkIndex.LEFT_WRIST],
  [PoseLandmarkIndex.LEFT_WRIST, PoseLandmarkIndex.LEFT_INDEX],
  [PoseLandmarkIndex.RIGHT_SHOULDER, PoseLandmarkIndex.RIGHT_ELBOW],
  [PoseLandmarkIndex.RIGHT_ELBOW, PoseLandmarkIndex.RIGHT_WRIST],
  [PoseLandmarkIndex.RIGHT_WRIST, PoseLandmarkIndex.RIGHT_INDEX],
  [PoseLandmarkIndex.LEFT_SHOULDER, PoseLandmarkIndex.LEFT_HIP],
  [PoseLandmarkIndex.RIGHT_SHOULDER, PoseLandmarkIndex.RIGHT_HIP],
  [PoseLandmarkIndex.LEFT_HIP, PoseLandmarkIndex.RIGHT_HIP],
  [PoseLandmarkIndex.LEFT_HIP, PoseLandmarkIndex.LEFT_KNEE],
  [PoseLandmarkIndex.LEFT_KNEE, PoseLandmarkIndex.LEFT_ANKLE],
  [PoseLandmarkIndex.LEFT_ANKLE, PoseLandmarkIndex.LEFT_HEEL],
  [PoseLandmarkIndex.RIGHT_HIP, PoseLandmarkIndex.RIGHT_KNEE],
  [PoseLandmarkIndex.RIGHT_KNEE, PoseLandmarkIndex.RIGHT_ANKLE],
  [PoseLandmarkIndex.RIGHT_ANKLE, PoseLandmarkIndex.RIGHT_HEEL],
];

export const LiveSkeletonOverlay: React.FC<Props> = ({ pose, width, height }) => {
  if (!pose || !pose.personDetected) return null;

  const landmarks = pose.landmarks;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="none">
      <Svg width={width} height={height}>
        {/* Draw Bones */}
        {BONE_CONNECTIONS.map(([startIndex, endIndex], i) => {
          const start = landmarks[startIndex];
          const end = landmarks[endIndex];
          if (!start || !end || start.visibility < 0.4 || end.visibility < 0.4) return null;

          return (
            <Line
              key={`bone-${i}`}
              x1={start.x * width}
              y1={start.y * height}
              x2={end.x * width}
              y2={end.y * height}
              stroke="#00E676"
              strokeWidth="3"
            />
          );
        })}

        {/* Draw Keypoint Joints */}
        {Object.entries(landmarks).map(([key, lm]) => {
          if (!lm || lm.visibility < 0.4) return null;
          const x = lm.x * width;
          const y = lm.y * height;
          const isFingertip =
            Number(key) === PoseLandmarkIndex.LEFT_INDEX ||
            Number(key) === PoseLandmarkIndex.RIGHT_INDEX;

          return (
            <Circle
              key={`lm-${key}`}
              cx={x}
              cy={y}
              r={isFingertip ? 6 : 4}
              fill={isFingertip ? '#FF3D00' : '#00E676'}
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
});
