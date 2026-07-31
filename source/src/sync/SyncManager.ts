import NetInfo from '@react-native-community/netinfo';
import { SyncRepository } from '../database/repositories/SyncRepository';
import { SyncApi } from '../network/SyncApi';
import { processQueueItem } from './UploadWorker';

type SyncState = 'idle' | 'syncing' | 'paused';

type SyncListener = (state: SyncState, pendingCount: number) => void;

class SyncManagerClass {
  private state: SyncState = 'idle';
  private abortRequested = false;
  private listeners: Set<SyncListener> = new Set();
  private netInfoUnsubscribe: (() => void) | null = null;

  // ── Public API ────────────────────────────────────────────────────────────

  start(): void {
    if (this.netInfoUnsubscribe) return; // already watching

    this.netInfoUnsubscribe = NetInfo.addEventListener(netState => {
      const online = netState.isConnected === true && netState.isInternetReachable === true;
      if (online) {
        this.triggerSync();
      } else {
        this.pause();
      }
    });

    // Run immediately in case we are already online
    NetInfo.fetch().then(netState => {
      if (netState.isConnected && netState.isInternetReachable) {
        this.triggerSync();
      }
    });
  }

  stop(): void {
    this.netInfoUnsubscribe?.();
    this.netInfoUnsubscribe = null;
    this.abortRequested = true;
    this.setState('idle', 0);
  }

  async triggerSync(): Promise<void> {
    if (this.state === 'syncing') return;
    this.abortRequested = false;
    await this.runCycle();
  }

  addListener(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async getPendingCount(): Promise<number> {
    return SyncRepository.countPending();
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  private pause(): void {
    if (this.state === 'syncing') {
      this.abortRequested = true;
    }
    this.setState('paused', 0);
  }

  private async runCycle(): Promise<void> {
    const serverReachable = await SyncApi.healthCheck();
    if (!serverReachable) {
      this.setState('paused', 0);
      return;
    }

    const pending = await SyncRepository.getPending();
    if (pending.length === 0) {
      this.setState('idle', 0);
      return;
    }

    this.setState('syncing', pending.length);

    for (const item of pending) {
      if (this.abortRequested) break;

      await processQueueItem(item);

      const remaining = await SyncRepository.countPending();
      this.setState('syncing', remaining);
    }

    const finalCount = await SyncRepository.countPending();
    this.setState(finalCount === 0 ? 'idle' : 'paused', finalCount);
  }

  private setState(state: SyncState, pendingCount: number): void {
    this.state = state;
    this.listeners.forEach(l => l(state, pendingCount));
  }
}

export const SyncManager = new SyncManagerClass();
