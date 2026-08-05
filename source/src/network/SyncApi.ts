import { ApiClient } from './ApiClient';

export const SyncApi = {
  async healthCheck(): Promise<boolean> {
    try {
      const { data } = await ApiClient.get<any>('/health', { timeout: 5_000 });
      return data?.status === 'ok' || data?.success === true;
    } catch {
      return false;
    }
  },
};
