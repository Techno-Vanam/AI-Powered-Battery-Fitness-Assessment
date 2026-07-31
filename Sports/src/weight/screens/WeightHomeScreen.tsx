import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import networkService from '../services/NetworkService';
import sqLiteService from '../services/SQLiteService';
import syncService from '../services/SyncService';
import { NetworkBadge } from '../components/NetworkBadge';

interface WeightHomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const WeightHomeScreen: React.FC<WeightHomeScreenProps> = ({ onNavigate }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);

  const loadData = async () => {
    const count = await sqLiteService.getPendingCount();
    setPendingCount(count);
  };

  useEffect(() => {
    loadData();

    const unsubscribeNet = networkService.subscribe((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable);
      loadData();
    });

    return () => {
      unsubscribeNet();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleManualSync = async () => {
    if (!isOnline) return;
    setSyncing(true);
    await syncService.syncPendingMeasurements();
    await loadData();
    setSyncing(false);
  };

  const toggleSimulatedNetwork = () => {
    networkService.setSimulatedStatus(!isOnline);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Module Title Banner */}
      <View style={styles.header}>
        <Text style={styles.title}>Weight Measurement Module</Text>
        <Text style={styles.subtitle}>AI-Powered Scale OCR & Offline Synchronization</Text>
      </View>

      {/* Network Status Badge */}
      <NetworkBadge isOnline={isOnline} onToggleSimulated={toggleSimulatedNetwork} />
      <Text style={styles.networkHint}>Tap badge above to toggle online/offline mode</Text>

      {/* Main Action Card */}
      <View style={styles.actionCard}>
        <Text style={styles.cardTitle}>Automatic Weight Reader</Text>
        <Text style={styles.cardDescription}>
          Point your mobile camera at any digital weighing scale display to scan digits automatically.
        </Text>

        <TouchableOpacity
          style={styles.captureButton}
          activeOpacity={0.8}
          onPress={() => onNavigate('Camera')}
        >
          <Text style={styles.captureButtonText}>📷 CAPTURE WEIGHT</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Upload Offline Card */}
      <TouchableOpacity
        style={styles.pendingCard}
        activeOpacity={0.8}
        onPress={() => onNavigate('PendingUpload')}
      >
        <View style={styles.pendingLeft}>
          <Text style={styles.pendingLabel}>Pending Local Queue (SQLite)</Text>
          <Text style={styles.pendingSub}>
            {pendingCount === 0
              ? 'All measurements synced to MySQL database'
              : `${pendingCount} item(s) waiting for cloud upload`}
          </Text>
        </View>
        <View style={[styles.badgeCount, pendingCount > 0 ? styles.badgeActive : styles.badgeEmpty]}>
          <Text style={styles.badgeCountText}>{pendingCount}</Text>
        </View>
      </TouchableOpacity>

      {/* Manual Sync Trigger Button (if pending > 0 and online) */}
      {pendingCount > 0 && isOnline && (
        <TouchableOpacity
          style={[styles.syncButton, syncing && styles.disabledButton]}
          disabled={syncing}
          onPress={handleManualSync}
        >
          <Text style={styles.syncButtonText}>
            {syncing ? 'SYNCING TO MYSQL...' : '⚡ SYNC PENDING NOW'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Database Status Information */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>STORAGE ARCHITECTURE</Text>
        <Text style={styles.infoText}>• Local Cache: SQLite (Temporary Storage)</Text>
        <Text style={styles.infoText}>• Backend DB: MySQL (Permanent Storage)</Text>
        <Text style={styles.infoText}>• ML OCR: Google ML Kit Text Recognition</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  content: {
    padding: 20
  },
  header: {
    marginTop: 10,
    marginBottom: 16,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A237E',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13,
    color: '#5C6BC0',
    marginTop: 4,
    textAlign: 'center'
  },
  networkHint: {
    fontSize: 11,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 16
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8
  },
  cardDescription: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  captureButton: {
    backgroundColor: '#1A237E',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1
  },
  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    marginBottom: 16
  },
  pendingLeft: {
    flex: 1,
    paddingRight: 12
  },
  pendingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#37474F'
  },
  pendingSub: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 4
  },
  badgeCount: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeActive: {
    backgroundColor: '#D32F2F'
  },
  badgeEmpty: {
    backgroundColor: '#4CAF50'
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15
  },
  syncButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  disabledButton: {
    opacity: 0.6
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5
  },
  infoBox: {
    backgroundColor: '#E8EAF6',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3F51B5'
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A237E',
    marginBottom: 6,
    letterSpacing: 1
  },
  infoText: {
    fontSize: 12,
    color: '#3949AB',
    marginVertical: 2
  }
});
