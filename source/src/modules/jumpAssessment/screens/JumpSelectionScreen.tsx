/**
 * Jump Test Selection Screen (Standing Vertical Jump vs Standing Broad Jump)
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useCameraPermissions } from '../hooks/useCameraPermissions';

interface Props {
  navigation: any;
}

export const JumpSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { requestPermission } = useCameraPermissions();

  const handleStartTest = (testType: 'vertical' | 'broad') => {
    void requestPermission();
    navigation.navigate('JumpCalibration', { testType });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Jump Assessment Suite</Text>
      <Text style={styles.headerSubtitle}>
        AI-Powered Offline Fitness Testing with Zero Data Storage
      </Text>

      {/* Vertical Jump Card */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => handleStartTest('vertical')}
      >
        <Text style={styles.cardBadge}>VERTICAL TEST</Text>
        <Text style={styles.cardTitle}>Standing Vertical Jump</Text>
        <Text style={styles.cardDesc}>
          Measures difference between standing reach and maximum jump fingertip height.
        </Text>
      </TouchableOpacity>

      {/* Broad Jump Card */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => handleStartTest('broad')}
      >
        <Text style={styles.cardBadge}>BROAD TEST</Text>
        <Text style={styles.cardTitle}>Standing Broad Jump</Text>
        <Text style={styles.cardDesc}>
          Measures horizontal distance from takeoff line to heel landing stability.
        </Text>
      </TouchableOpacity>

      {/* History Button */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('JumpHistory')}
      >
        <Text style={styles.historyButtonText}>View Assessment History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardBadge: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDesc: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  historyButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  historyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
