import { useEffect, useState } from 'react';
import { SyncManager } from '../sync/SyncManager';

export type SyncState = 'idle' | 'syncing' | 'paused';

export interface UseSyncResult {
  syncState: SyncState;
  pendingCount: number;
  triggerSync: () => Promise<void>;
}

export function useSync(): UseSyncResult {
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Seed initial pending count
    SyncManager.getPendingCount().then(setPendingCount);

    const unsubscribe = SyncManager.addListener((state, count) => {
      setSyncState(state);
      setPendingCount(count);
    });

    return unsubscribe;
  }, []);

  return {
    syncState,
    pendingCount,
    triggerSync: () => SyncManager.triggerSync(),
  };
}
