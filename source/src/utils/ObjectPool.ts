/**
 * Object Pool Utility for Low-End Android Devices (3 GB RAM).
 * Pre-allocates and recycles point arrays and keypoint structures to eliminate GC pauses.
 */

import type { Point2D } from '@height/HeightTypes';
import type { Landmark } from '@vision/pose/PoseTypes';

class Point2DPool {
  private pool: Point2D[] = [];
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

class LandmarkPool {
  private pool: Landmark[] = [];
  private readonly maxSize = 128;

  public acquire(x = 0, y = 0, z = 0, visibility = 0, presence = 0): Landmark {
    const item = this.pool.pop();
    if (item) {
      item.x = x;
      item.y = y;
      item.z = z;
      item.visibility = visibility;
      item.presence = presence;
      return item;
    }
    return { x, y, z, visibility, presence };
  }

  public release(item: Landmark): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(item);
    }
  }

  public releaseArray(items: Landmark[]): void {
    for (const item of items) {
      this.release(item);
    }
  }
}

export const pointPool = new Point2DPool();
export const landmarkPool = new LandmarkPool();
