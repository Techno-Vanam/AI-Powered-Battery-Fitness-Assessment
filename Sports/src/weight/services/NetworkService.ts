import { NetworkState } from '../types';

type NetworkCallback = (state: NetworkState) => void;

class NetworkService {
  private listeners: Set<NetworkCallback> = new Set();
  private currentState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi'
  };
  private unsubscribeNetInfo: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const NetInfo = require('@react-native-community/netinfo');
      this.unsubscribeNetInfo = NetInfo.addEventListener((state: any) => {
        const isConnected = !!state.isConnected;
        const isInternetReachable = state.isInternetReachable !== false;
        
        this.currentState = {
          isConnected,
          isInternetReachable,
          type: state.type || 'unknown'
        };

        this.notifyListeners();
      });
    } catch (e: any) {
      console.warn('[NetworkService] NetInfo native module unavailable. Operating with simulated network status.', e?.message);
    }
  }

  public subscribe(callback: NetworkCallback): () => void {
    this.listeners.add(callback);
    // Immediately emit current state
    callback(this.currentState);

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentState));
  }

  public getCurrentState(): NetworkState {
    return this.currentState;
  }

  public isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable;
  }

  /**
   * Helper method for testing/toggling online status manually in demo UI
   */
  public setSimulatedStatus(isConnected: boolean) {
    this.currentState = {
      isConnected,
      isInternetReachable: isConnected,
      type: isConnected ? 'wifi' : 'none'
    };
    this.notifyListeners();
  }
}

export default new NetworkService();
