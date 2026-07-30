import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { createTables } from './src/db/schema';
import { startSyncListener } from './src/services/syncService';

function App() {
  useEffect(() => {
    createTables();
    const stopSync = startSyncListener();
    return () => stopSync();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;
