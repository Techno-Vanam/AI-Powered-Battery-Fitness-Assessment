import { ApiClient } from './ApiClient';
import type { HeightTest } from '../database/repositories/HeightRepository';

export interface HeightUploadResponse {
  id: string;
  createdAt: number;
}

export const HeightApi = {
  async upload(test: HeightTest): Promise<HeightUploadResponse> {
    const { data } = await ApiClient.post<HeightUploadResponse>('/height-tests', {
      id: test.id,
      athleteId: test.athleteId,
      heightCm: test.heightCm,
      heightPixels: test.heightPixels,
      markerScale: test.markerScale,
      markerConfidence: test.markerConfidence,
      poseConfidence: test.poseConfidence,
      overallConfidence: test.overallConfidence,
      deviceId: test.deviceId,
      createdAt: test.createdAt,
    });
    return data;
  },

  async exists(id: string): Promise<boolean> {
    try {
      await ApiClient.head(`/height-tests/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
