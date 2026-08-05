import { ApiClient } from './ApiClient';
import type { HeightTest } from '../database/repositories/HeightRepository';

export interface HeightUploadResponse {
  measurementId: string;
  createdAt: number;
  idempotent?: boolean;
}

export const HeightApi = {
  async upload(test: HeightTest): Promise<HeightUploadResponse> {
    const { data } = await ApiClient.post<HeightUploadResponse>('/tests/height', {
      measurementId: test.measurementId,
      athleteId: test.athleteId,
      teamId: test.teamId,
      sessionId: test.sessionId,
      heightCm: test.heightCm,
      confidence: test.confidence,
      deviceModel: test.deviceModel,
      timestamp: test.timestamp,
      calibrationMethod: test.calibrationMethod,
    });
    return data;
  },

  async exists(measurementId: string): Promise<boolean> {
    try {
      await ApiClient.head(`/tests/height/${measurementId}`);
      return true;
    } catch {
      return false;
    }
  },
};
