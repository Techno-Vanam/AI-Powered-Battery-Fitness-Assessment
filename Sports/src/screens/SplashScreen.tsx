import React from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/camera';
import { useSplashScreenViewModel } from '../hooks/useSplashScreenViewModel';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { statusText } = useSplashScreenViewModel(() => {
    navigation.replace('Home');
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />

      <View style={styles.brandingContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>
        <Text style={styles.tagline}>TECHNO VANAM</Text>
        <Text style={styles.title}>AI Battery Fitness</Text>
        <Text style={styles.subtitle}>Precision Height & Pose Engine</Text>
      </View>

      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#3b82f6" style={styles.spinner} />
        <Text style={styles.statusText}>{statusText}</Text>
        <Text style={styles.versionText}>v1.0.0 • Offline First Architecture</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 44,
  },
  tagline: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 6,
  },
  footerContainer: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 12,
  },
  statusText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  versionText: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '500',
  },
});
