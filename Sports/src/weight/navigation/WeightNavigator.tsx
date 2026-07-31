import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { WeightHomeScreen } from '../screens/WeightHomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { OCRProcessingScreen } from '../screens/OCRProcessingScreen';
import { OCRResultScreen } from '../screens/OCRResultScreen';
import { PendingUploadScreen } from '../screens/PendingUploadScreen';

type ScreenName = 'WeightHome' | 'Camera' | 'OCRProcessing' | 'OCRResult' | 'PendingUpload';

interface NavigationState {
  currentScreen: ScreenName;
  params: any;
}

export const WeightNavigator: React.FC = () => {
  const [navState, setNavState] = useState<NavigationState>({
    currentScreen: 'WeightHome',
    params: {}
  });

  const navigate = (screen: ScreenName | string, params: any = {}) => {
    setNavState({
      currentScreen: screen as ScreenName,
      params
    });
  };

  const renderScreen = () => {
    switch (navState.currentScreen) {
      case 'WeightHome':
        return <WeightHomeScreen onNavigate={navigate} />;
      case 'Camera':
        return <CameraScreen onNavigate={navigate} />;
      case 'OCRProcessing':
        return (
          <OCRProcessingScreen
            imagePath={navState.params?.imagePath}
            onNavigate={navigate}
          />
        );
      case 'OCRResult':
        return (
          <OCRResultScreen
            measurement={navState.params?.measurement || {}}
            ocrResult={navState.params?.ocrResult || { confidence: 0.95, detectedWeight: 72.5, category: 'ACCEPT', rawText: '72.5 kg', processingTimeMs: 120 }}
            onNavigate={navigate}
          />
        );
      case 'PendingUpload':
        return <PendingUploadScreen onNavigate={navigate} />;
      default:
        return <WeightHomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  content: {
    flex: 1
  }
});
