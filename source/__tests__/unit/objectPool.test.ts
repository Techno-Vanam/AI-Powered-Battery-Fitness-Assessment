import { pointPool } from '../../src/utils/ObjectPool';

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
});
