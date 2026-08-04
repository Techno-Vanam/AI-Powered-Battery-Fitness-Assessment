import NetInfo from '@react-native-community/netinfo';
import { API_BASE_URL } from '../config/api';
import {
  getAllPendingSync,
  incrementAttempts,
  removeSyncItem,
  markUserConflict,
  markUserSynced,
} from '../db/syncQueueRepository';
import { getUserByLocalId } from '../db/userRepository';

let isSyncing = false;

type SyncDetail = {
  local_id: string;
  server_id?: string;
  status: 'synced' | 'updated' | 'conflict' | 'failed';
  reason?: string;
};

type SyncResponse = {
  success?: boolean;
  data?: {
    synced: number;
    updated: number;
    conflicts: number;
    failed: number;
    details: SyncDetail[];
  };
};

/** Build latest user payload per local_id from sync queue + local DB */
function buildUsersPayload(pendingItems: ReturnType<typeof getAllPendingSync>) {
  const byLocalId = new Map<string, object>();

  for (const item of pendingItems) {
    const parsed = JSON.parse(item.payload);
    const localId = item.entity_local_id;
    const fromDb = getUserByLocalId(localId);
    byLocalId.set(localId, {
      ...(fromDb ?? parsed),
      local_id: localId,
      updated_at: new Date().toISOString(),
    });
  }

  return Array.from(byLocalId.values());
}

export const runSyncJob = async (): Promise<void> => {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const pendingItems = getAllPendingSync();
    if (pendingItems.length === 0) return;

    const users = buildUsersPayload(pendingItems);
    console.log(`[Sync] Pushing ${users.length} user(s) to cloud…`);

    const response = await fetch(`${API_BASE_URL}/sync/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users }),
    });

    if (!response.ok) {
      console.warn(`[Sync] Server error: ${response.status}`);
      pendingItems.forEach(item => incrementAttempts(item.queue_id));
      return;
    }

    const body = (await response.json()) as SyncResponse;
    const details = body.data?.details ?? [];
    const detailByLocalId = new Map(details.map(d => [d.local_id, d]));

    for (const item of pendingItems) {
      const detail = detailByLocalId.get(item.entity_local_id);

      if (detail?.status === 'conflict') {
        markUserConflict(item.entity_local_id);
        removeSyncItem(item.queue_id);
        console.warn(`[Sync] Conflict for ${item.entity_local_id}`);
        continue;
      }

      if (detail?.status === 'failed') {
        incrementAttempts(item.queue_id);
        console.warn(`[Sync] Failed for ${item.entity_local_id}: ${detail.reason}`);
        continue;
      }

      if (detail?.status === 'synced' || detail?.status === 'updated') {
        removeSyncItem(item.queue_id);
        markUserSynced(item.entity_local_id, detail.server_id ?? '');
        console.log(`[Sync] ✓ ${item.entity_local_id} → cloud synced`);
        continue;
      }

      incrementAttempts(item.queue_id);
    }
  } catch (err) {
    console.warn('[Sync] Job failed:', err);
  } finally {
    isSyncing = false;
  }
};

export const startSyncListener = (): (() => void) => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      runSyncJob();
    }
  });

  NetInfo.fetch().then(state => {
    if (state.isConnected && state.isInternetReachable) {
      runSyncJob();
    }
  });

  return unsubscribe;
};
