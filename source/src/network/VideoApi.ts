import { ApiClient } from './ApiClient';
import type { VideoRecord } from '../database/repositories/VideoRepository';

export interface VideoUploadResponse {
  id: string;
  remoteUrl: string;
}

export const VideoApi = {
  async upload(video: VideoRecord): Promise<VideoUploadResponse> {
    const form = new FormData();
    form.append('id', video.id);
    form.append('athleteId', video.athleteId);
    form.append('duration', String(video.duration));
    form.append('fileSize', String(video.fileSize));
    form.append('createdAt', String(video.createdAt));
    form.append('file', {
      uri: `file://${video.localPath}`,
      type: 'video/mp4',
      name: `${video.id}.mp4`,
    } as any);

    const { data } = await ApiClient.post<VideoUploadResponse>('/videos', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000, // videos can be large
    });
    return data;
  },

  async exists(id: string): Promise<boolean> {
    try {
      await ApiClient.head(`/videos/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
