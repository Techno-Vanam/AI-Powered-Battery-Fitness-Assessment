/**
 * Object Pool Utility for Low-End Android Devices (3 GB RAM).
 */

import type { Point2D } from '@height/types/HeightTypes';

interface PooledPoint {
  x: number;
  y: number;
}

class Point2DPool {
  private pool: PooledPoint[] = [];
  private readonly maxSize = 64;

  public acquire(x = 0, y = 0): Point2D {
    const item = this.pool.pop();
    if (item) {
      item.x = x;
      item.y = y;
      return item;
    }
    return { x, y };
  }

  public release(item: Point2D): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(item);
    }
  }

  public releaseArray(items: Point2D[]): void {
    for (const item of items) {
      this.release(item);
    }
  }
}

export const pointPool = new Point2DPool();
