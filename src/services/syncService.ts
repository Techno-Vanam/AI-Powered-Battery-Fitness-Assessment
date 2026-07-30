import NetInfo from '@react-native-community/netinfo';
import {
  getAllPendingSync,
  incrementAttempts,
  markUserSynced,
  removeSyncItem,
} from '../db/syncQueueRepository';

const REMOTE_API_BASE = 'https://your-api-server.com/api'; // TODO: Replace with real server URL

let isSyncing = false;

export const runSyncJob = async (): Promise<void> => {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const pendingItems = getAllPendingSync(); // synchronous
    if (pendingItems.length === 0) return;

    console.log(`[Sync] ${pendingItems.length} item(s) pending.`);

    for (const item of pendingItems) {
      try {
        const payload = JSON.parse(item.payload);
        let response: Response;

        if (item.operation === 'INSERT') {
          response = await fetch(`${REMOTE_API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          response = await fetch(
            `${REMOTE_API_BASE}/users/${payload.id_number}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );
        }

        if (response.ok) {
          const data = await response.json();
          const serverId = data?.id || data?.server_id || null;
          if (serverId) markUserSynced(item.entity_local_id, serverId);
          removeSyncItem(item.queue_id);
          console.log(`[Sync] ✓ Synced item ${item.queue_id}`);
        } else {
          console.warn(`[Sync] Server rejected ${item.queue_id}: ${response.status}`);
          incrementAttempts(item.queue_id);
        }
      } catch (err) {
        console.warn(`[Sync] ✗ Failed item ${item.queue_id}:`, err);
        incrementAttempts(item.queue_id);
      }
    }
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
  return unsubscribe;
};
