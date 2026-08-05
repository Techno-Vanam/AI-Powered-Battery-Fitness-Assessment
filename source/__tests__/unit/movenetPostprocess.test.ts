import {
  keypointsToPosePixels,
  parseMoveNetOutput,
} from '../../src/height/detection/movenetPostprocess';
import { VERTEX_OFFSET_FACTOR } from '../../src/height/detection/poseConstants';

describe('MoveNet postprocess', () => {
  test('VERTEX_OFFSET_FACTOR default is 0.6', () => {
    expect(VERTEX_OFFSET_FACTOR).toBe(0.6);
  });

  test('parses 17 keypoints from flat output', () => {
    const buffer = new ArrayBuffer(17 * 3 * 4);
    const floats = new Float32Array(buffer);
    // nose at center-top
    floats[0] = 0.2;
    floats[1] = 0.5;
    floats[2] = 0.9;
    // shoulders
    floats[5 * 3] = 0.35;
    floats[5 * 3 + 1] = 0.4;
    floats[5 * 3 + 2] = 0.85;
    floats[6 * 3] = 0.35;
    floats[6 * 3 + 1] = 0.6;
    floats[6 * 3 + 2] = 0.85;
    // ankles
    floats[15 * 3] = 0.9;
    floats[15 * 3 + 1] = 0.45;
    floats[15 * 3 + 2] = 0.8;
    floats[16 * 3] = 0.9;
    floats[16 * 3 + 1] = 0.55;
    floats[16 * 3 + 2] = 0.8;

    const keypoints = parseMoveNetOutput(buffer);
    expect(keypoints).toHaveLength(17);

    const pose = keypointsToPosePixels(keypoints, 1080, 1920);
    expect(pose).not.toBeNull();
    expect(pose!.heelY).toBeGreaterThan(pose!.vertexY);
  });

  test('returns null when confidence too low', () => {
    const buffer = new ArrayBuffer(17 * 3 * 4);
    const floats = new Float32Array(buffer);
    floats[2] = 0.01;
    const keypoints = parseMoveNetOutput(buffer);
    expect(keypointsToPosePixels(keypoints, 1080, 1920)).toBeNull();
  });
});
