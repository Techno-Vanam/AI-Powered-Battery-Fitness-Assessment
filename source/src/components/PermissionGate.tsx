import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

interface Props {
  isChecking: boolean;
  isBlocked: boolean;
  onRetry: () => void;
  onOpenSettings: () => void;
}

export function PermissionGate({ isChecking, isBlocked, onRetry, onOpenSettings }: Props) {
  if (isChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.message}>Checking camera permission…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.title}>Camera Access Required</Text>
      <Text style={styles.message}>
        {isBlocked
          ? 'Camera permission has been permanently denied. Please enable it in your device settings.'
          : 'This app needs camera access to measure height using the ArUco marker and pose estimation.'}
      </Text>

      {isBlocked ? (
        <TouchableOpacity style={styles.button} onPress={onOpenSettings}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: { fontSize: 56, marginBottom: 16 },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
