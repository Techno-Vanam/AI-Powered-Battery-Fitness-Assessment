import { ApiClient } from './ApiClient';

export interface SyncHealthResponse {
  status: 'ok';
  serverTime: number;
}

export const SyncApi = {
  async healthCheck(): Promise<boolean> {
    try {
      const { data } = await ApiClient.get<SyncHealthResponse>('/health', { timeout: 5_000 });
      return data.status === 'ok';
    } catch {
      return false;
    }
  },
};
