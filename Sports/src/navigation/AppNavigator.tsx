import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '@screens/SplashScreen';
import { HomeScreen } from '@screens/HomeScreen';
import { AthleteRegistrationScreen } from '@screens/AthleteRegistrationScreen';
import { AthleteListScreen } from '@screens/AthleteListScreen';
import { HeightTestInstructionsScreen } from '@screens/HeightTestInstructionsScreen';
import { CameraScreen } from '@screens/CameraScreen';
import { HeightResultScreen } from '@screens/HeightResultScreen';
import HistoryScreen from '@screens/HistoryScreen';
import SyncStatusScreen from '@screens/SyncStatusScreen';
import { SettingsScreen } from '@screens/SettingsScreen';
import type { RootStackParamList } from '@types/camera';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AthleteRegistration" component={AthleteRegistrationScreen} />
        <Stack.Screen name="AthleteList" component={AthleteListScreen} />
        <Stack.Screen
          name="HeightTestInstructions"
          component={HeightTestInstructionsScreen}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ orientation: 'portrait' }}
        />
        <Stack.Screen name="HeightResult" component={HeightResultScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="SyncStatus" component={SyncStatusScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

