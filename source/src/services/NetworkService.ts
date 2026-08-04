import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export type NetworkStatusListener = (isConnected: boolean) => void;

let _isConnected = true;
const _listeners = new Set<NetworkStatusListener>();

// Initialize NetInfo event subscription
NetInfo.addEventListener((state: NetInfoState) => {
  const connected = Boolean(state.isConnected);
  if (_isConnected !== connected) {
    _isConnected = connected;
    _listeners.forEach((listener) => listener(_isConnected));
  }
});

export const NetworkService = {
  /**
   * Get current network status (async check)
   */
  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return Boolean(state.isConnected);
  },

  /**
   * Synchronous getter for current cached connection state
   */
  getIsConnectedSync(): boolean {
    return _isConnected;
  },

  /**
   * Subscribe to network connectivity state changes
   */
  subscribe(listener: NetworkStatusListener): () => void {
    _listeners.add(listener);
    // Immediately emit current status to new subscriber
    listener(_isConnected);

    return () => {
      _listeners.delete(listener);
    };
  },
};
