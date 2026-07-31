import { pointPool, landmarkPool } from '../../src/utils/ObjectPool';

describe('Unit Tests - ObjectPool Utility', () => {
  test('pointPool acquires, releases, and recycles Point2D objects', () => {
    const pt1 = pointPool.acquire(10, 20);
    expect(pt1.x).toBe(10);
    expect(pt1.y).toBe(20);

    pointPool.release(pt1);

    const pt2 = pointPool.acquire(30, 40);
    expect(pt2.x).toBe(30);
    expect(pt2.y).toBe(40);

    pointPool.releaseArray([pt1, pt2]);
  });

  test('landmarkPool acquires, releases, and recycles Landmark objects', () => {
    const lm1 = landmarkPool.acquire(0.1, 0.2, 0.3, 0.9, 0.95);
    expect(lm1.x).toBe(0.1);
    expect(lm1.y).toBe(0.2);
    expect(lm1.visibility).toBe(0.9);

    landmarkPool.release(lm1);

    const lm2 = landmarkPool.acquire(0.5, 0.6, 0.7, 0.8, 0.85);
    expect(lm2.x).toBe(0.5);

    landmarkPool.releaseArray([lm1, lm2]);
  });
});
