/**
 * Jump Test Selection Screen (Standing Vertical Jump vs Standing Broad Jump)
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  navigation: any;
}

export const JumpSelectionScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Jump Assessment Suite</Text>
      <Text style={styles.headerSubtitle}>
        AI-Powered Offline Fitness Testing with Zero Data Storage
      </Text>

      {/* Airtime Video Scrubber Card (MyJump 2 Method) */}
      <TouchableOpacity
        style={[styles.card, { borderColor: '#00E676' }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('JumpFrameAnalysis', { testType: 'vertical' })}
      >
        <Text style={[styles.cardBadge, { color: '#00E676' }]}>AIRTIME METHOD [SCIENTIFIC H = (g×t²)/8]</Text>
        <Text style={styles.cardTitle}>Airtime Frame Analysis</Text>
        <Text style={styles.cardDesc}>
          Upload or record jump video, set precise takeoff and landing frame markers, and calculate jump height via physics airtime formula.
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
