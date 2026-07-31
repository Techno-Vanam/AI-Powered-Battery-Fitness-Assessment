import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WeightNavigator } from './src/weight/navigation/WeightNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <WeightNavigator />
    </SafeAreaProvider>
  );
}

export default App;
