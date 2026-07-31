import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/camera';
import { AthleteRepository } from '../database/repositories/AthleteRepository';
import { HeightRepository } from '../database/repositories/HeightRepository';
import { useSync } from '../hooks/useSync';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [athleteCount, setAthleteCount] = useState(0);
  const [testCount, setTestCount] = useState(0);
  const { pendingCount } = useSync();

  // Reload stats whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function fetchStats() {
        try {
          const athletes = await AthleteRepository.getAll();
          const tests = await HeightRepository.getAll();
          if (active) {
            setAthleteCount(athletes.length);
            setTestCount(tests.length);
          }
        } catch (e) {
          console.warn('Failed to load home stats', e);
        }
      }
      fetchStats();
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.badge}>TECHNO VANAM AI</Text>
            <Text style={styles.title}>Battery Fitness{'\n'}Assessment</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.syncStatusBtn}
              onPress={() => navigation.navigate('SyncStatus')}
            >
              <Text style={styles.syncIcon}>🔄</Text>
              <Text style={styles.syncCount}>{pendingCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.syncStatusBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.syncIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{athleteCount}</Text>
            <Text style={styles.statLabel}>Athletes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#22c55e' }]}>{testCount}</Text>
            <Text style={styles.statLabel}>Tests Done</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Sync</Text>
          </View>
        </View>

        {/* Action Grid */}
        <Text style={styles.sectionTitle}>Main Workflow</Text>
        <View style={styles.menuGrid}>
          {/* Card 1: Register Athlete */}
          <TouchableOpacity
            style={[styles.menuCard, styles.menuCardPrimary]}
            onPress={() => navigation.navigate('AthleteRegistration')}
            activeOpacity={0.85}
          >
            <View style={styles.menuIconCircle}>
              <Text style={styles.menuIcon}>👤+</Text>
            </View>
            <Text style={styles.menuTitle}>Register Athlete</Text>
            <Text style={styles.menuSub}>Add new athlete with ID, DOB & category</Text>
          </TouchableOpacity>

          {/* Card 2: Select Athlete & Test */}
          <TouchableOpacity
            style={[styles.menuCard, styles.menuCardAccent]}
            onPress={() => navigation.navigate('AthleteList', { selectForTest: true })}
            activeOpacity={0.85}
          >
            <View style={[styles.menuIconCircle, styles.iconCircleGreen]}>
              <Text style={styles.menuIcon}>📐</Text>
            </View>
            <Text style={styles.menuTitle}>Measure Height</Text>
            <Text style={styles.menuSub}>Select registered athlete & start test</Text>
          </TouchableOpacity>

          {/* Card 3: Athlete Roster */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('AthleteList')}
            activeOpacity={0.85}
          >
            <View style={styles.menuIconCircle}>
              <Text style={styles.menuIcon}>📋</Text>
            </View>
            <Text style={styles.menuTitle}>Athlete List</Text>
            <Text style={styles.menuSub}>View, search & edit athlete profiles</Text>
          </TouchableOpacity>

          {/* Card 4: Measurement History */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.85}
          >
            <View style={styles.menuIconCircle}>
              <Text style={styles.menuIcon}>📊</Text>
            </View>
            <Text style={styles.menuTitle}>Test History</Text>
            <Text style={styles.menuSub}>Offline records, date & sync filters</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Instructions banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>💡 Measurement Prerequisites</Text>
          <Text style={styles.infoBannerText}>
            1. Ensure 21 cm ArUco marker is placed flat near athlete heels.{'\n'}
            2. Full body (head vertex to ankles) must remain visible in frame.{'\n'}
            3. Hold position until height lock indicator turns green.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  badge: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
  },
  syncStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 6,
  },
  syncIcon: { fontSize: 14 },
  syncCount: { color: '#60a5fa', fontSize: 13, fontWeight: '700' },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1f2937',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#3b82f6',
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  sectionTitle: {
    color: '#e5e7eb',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  menuGrid: {
    gap: 14,
    marginBottom: 28,
  },
  menuCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  menuCardPrimary: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: '#2563eb',
  },
  menuCardAccent: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: '#22c55e',
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircleGreen: {
    backgroundColor: '#14532d',
  },
  menuIcon: {
    fontSize: 22,
  },
  menuTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  menuSub: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
  },

  infoBanner: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  infoBannerTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoBannerText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 20,
  },
});
