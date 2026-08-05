import React from 'react';
import { StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { createTables } from './src/db/schema';
import { openDatabase } from './src/database/database';
import { startSyncListener } from './src/services/syncService';
import { SyncManager } from './src/sync/SyncManager';
import { colors } from './src/theme';
import { fontFamily } from './src/theme/fonts';

function applyGlobalFonts() {
  const defaultTextStyle = { fontFamily: fontFamily('400') };
  const defaultInputStyle = { fontFamily: fontFamily('400') };

  if (!(Text as any).defaultProps) {
    (Text as any).defaultProps = {};
  }
  (Text as any).defaultProps.style = [
    defaultTextStyle,
    (Text as any).defaultProps.style,
  ].filter(Boolean);

  if (!(TextInput as any).defaultProps) {
    (TextInput as any).defaultProps = {};
  }
  (TextInput as any).defaultProps.style = [
    defaultInputStyle,
    (TextInput as any).defaultProps.style,
  ].filter(Boolean);
}

applyGlobalFonts();

function App() {
  React.useEffect(() => {
    createTables();
    const stopUserSync = startSyncListener();

    let cancelled = false;
    (async () => {
      try {
        await openDatabase();
        if (!cancelled) {
          SyncManager.start();
        }
      } catch (e) {
        console.warn('[App] Height DB / SyncManager start failed:', e);
      }
    })();

    return () => {
      cancelled = true;
      stopUserSync();
      SyncManager.stop();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.container}>
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;
