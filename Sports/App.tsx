import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DatabaseProvider } from './src/database/DatabaseProvider';
import { SyncManager } from './src/sync/SyncManager';
import { configureBackgroundSync } from './src/sync/BackgroundSync';

export default function App() {
  useEffect(() => {
    SyncManager.start();
    configureBackgroundSync().catch(() => {});
    return () => SyncManager.stop();
  }, []);

  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <AppNavigator />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
