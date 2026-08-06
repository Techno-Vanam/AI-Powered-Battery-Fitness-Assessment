import {
  angleBetween,
  isKneeStraight,
  estimateFingertip,
  projectPointOntoAxis,
  EMAFilter,
  HoldDetector,
} from './measurementService';

test('angleBetween returns 180 for straight line', () => {
  const a = { x: 0, y: 0, score: 1 };
  const b = { x: 1, y: 0, score: 1 };
  const c = { x: 2, y: 0, score: 1 };
  expect(angleBetween(a, b, c)).toBeCloseTo(180, 5);
});

test('isKneeStraight returns true for near straight knee', () => {
  const landmarks = Array(17).fill({ x: 0, y: 0, score: 1 });
  landmarks[11] = { x: 0, y: 0, score: 1 }; // left hip
  landmarks[13] = { x: 1, y: 0, score: 1 }; // left knee
  landmarks[15] = { x: 2, y: 0, score: 1 }; // left ankle
  expect(isKneeStraight(landmarks as any, 'left')).toBe(true);
});

test('estimateFingertip extrapolates from wrist and elbow', () => {
  const landmarks = Array(17).fill({ x: 0, y: 0, score: 1 });
  landmarks[7] = { x: 1, y: 1, score: 1 }; // left_elbow
  landmarks[9] = { x: 2, y: 1, score: 0.9 }; // left_wrist
  const result = estimateFingertip(landmarks as any, 'left');
  expect(result).not.toBeNull();
  expect(result?.x).toBeGreaterThan(2);
});

test('projectPointOntoAxis projects along axis', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 2, y: 0 };
  const point = { x: 1, y: 1 };
  const projected = projectPointOntoAxis(point, a, b);
  expect(projected.t).toBeCloseTo(0.5, 5);
  expect(projected.projected).toBeCloseTo(1, 5);
});

test('EMAFilter smooths values', () => {
  const filter = new EMAFilter(0.5);
  expect(filter.update(10)).toBe(10);
  expect(filter.update(14)).toBeCloseTo(12, 5);
});

test('HoldDetector recognizes stability after stable values', () => {
  const hold = new HoldDetector(200, 0.5);
  const values = [10, 10.1, 9.9, 10.05];
  let stable = false;
  values.forEach((value) => {
    const state = hold.update(value);
    stable = state.stable;
  });
  expect(stable).toBe(true);
});
