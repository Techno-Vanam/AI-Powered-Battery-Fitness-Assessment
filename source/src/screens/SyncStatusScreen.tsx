import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/camera';
import { SyncRepository, type SyncQueueItem } from '../database/repositories/SyncRepository';
import { useSync } from '../hooks/useSync';

type Props = NativeStackScreenProps<RootStackParamList, 'SyncStatus'>;

export default function SyncStatusScreen({ navigation }: Props) {
  const { syncState, pendingCount, triggerSync } = useSync();
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);

  const loadQueue = useCallback(async () => {
    const items = await SyncRepository.getPending();
    setQueue(items);
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue, syncState]);

  const stateColor: Record<string, string> = {
    idle:    '#22c55e',
    syncing: '#3b82f6',
    paused:  '#f59e0b',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sync Status</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: stateColor[syncState] ?? '#888' }]} />
          <Text style={styles.statusLabel}>{syncState.toUpperCase()}</Text>
          {syncState === 'syncing' && <ActivityIndicator size="small" color="#3b82f6" style={{ marginLeft: 8 }} />}
        </View>
        <Text style={styles.pendingText}>{pendingCount} record{pendingCount !== 1 ? 's' : ''} pending</Text>

        <TouchableOpacity
          style={[styles.syncBtn, syncState === 'syncing' && styles.syncBtnDisabled]}
          onPress={triggerSync}
          disabled={syncState === 'syncing'}
        >
          <Text style={styles.syncBtnText}>Sync Now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Queue</Text>

      <FlatList
        data={queue}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Queue is empty.</Text>}
        renderItem={({ item }) => (
          <View style={styles.queueItem}>
            <View style={styles.queueLeft}>
              <Text style={styles.queueTable}>{item.tableName}</Text>
              <Text style={styles.queueId} numberOfLines={1}>{item.recordId}</Text>
            </View>
            <View style={styles.queueRight}>
              <Text style={styles.queueOp}>{item.operation}</Text>
              <Text style={styles.queueRetry}>Retries: {item.retryCount}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    gap: 16,
  },
  back: { color: '#2563eb', fontSize: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  statusCard: {
    backgroundColor: '#1e1e1e',
    margin: 16,
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pendingText: { color: '#888', fontSize: 14 },
  syncBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  syncBtnDisabled: { backgroundColor: '#1e3a5f' },
  syncBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sectionTitle: { color: '#888', fontSize: 12, fontWeight: '600', marginHorizontal: 16, marginBottom: 8, letterSpacing: 1 },
  list: { paddingHorizontal: 16, gap: 8 },
  empty: { color: '#555', textAlign: 'center', marginTop: 24 },
  queueItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  queueLeft: { flex: 1 },
  queueTable: { color: '#60a5fa', fontSize: 13, fontWeight: '600' },
  queueId: { color: '#555', fontSize: 11, marginTop: 2 },
  queueRight: { alignItems: 'flex-end', gap: 4 },
  queueOp: { color: '#a3a3a3', fontSize: 12 },
  queueRetry: { color: '#f59e0b', fontSize: 11 },
});
