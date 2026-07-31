import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import sqLiteService from '../services/SQLiteService';
import syncService from '../services/SyncService';
import networkService from '../services/NetworkService';
import { WeightMeasurement } from '../types';
import { NetworkBadge } from '../components/NetworkBadge';

interface PendingUploadScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const PendingUploadScreen: React.FC<PendingUploadScreenProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<WeightMeasurement[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);

  const fetchItems = async () => {
    const list = await sqLiteService.getPendingMeasurements();
    setItems(list);
  };

  useEffect(() => {
    fetchItems();

    const unsub = networkService.subscribe((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable);
      fetchItems();
    });

    return () => unsub();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const handleSyncAll = async () => {
    if (!isOnline) {
      Alert.alert('Offline Mode', 'Internet connection required to upload pending measurements to MySQL.');
      return;
    }

    setSyncing(true);
    const result = await syncService.syncPendingMeasurements();
    await fetchItems();
    setSyncing(false);

    Alert.alert(
      'Sync Finished',
      `Successfully uploaded ${result.successCount} of ${result.totalPending} pending measurement(s) to MySQL backend.`
    );
  };

  const handleDeleteItem = async (id: string) => {
    await sqLiteService.deleteMeasurement(id);
    await fetchItems();
  };

  const renderItem = ({ item }: { item: WeightMeasurement }) => {
    const formattedTime = new Date(item.timestamp).toLocaleString();

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <Text style={styles.weightText}>{item.weight.toFixed(1)} <Text style={styles.unitText}>KG</Text></Text>
          <Text style={styles.timeText}>{formattedTime}</Text>
          {item.ocrConfidence && (
            <Text style={styles.ocrText}>
              OCR Confidence: {Math.round(item.ocrConfidence * 100)}%
            </Text>
          )}
        </View>

        <View style={styles.cardRight}>
          <View style={[styles.statusTag, getStatusTagStyle(item.syncStatus)]}>
            <Text style={styles.statusText}>{item.syncStatus.toUpperCase()}</Text>
          </View>
          <Text style={styles.retryText}>Retries: {item.retryCount}</Text>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteItem(item.id)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('WeightHome')}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SQLite Offline Queue</Text>
        <View style={{ width: 60 }} />
      </View>

      <NetworkBadge
        isOnline={isOnline}
        onToggleSimulated={() => networkService.setSimulatedStatus(!isOnline)}
      />

      {/* Sync All Button Header */}
      {items.length > 0 && (
        <View style={styles.syncHeaderRow}>
          <TouchableOpacity
            style={[styles.syncAllBtn, (!isOnline || syncing) && styles.btnDisabled]}
            disabled={!isOnline || syncing}
            onPress={handleSyncAll}
          >
            <Text style={styles.syncAllText}>
              {syncing ? 'UPLOADING TO MYSQL...' : '⚡ UPLOAD ALL PENDING TO MYSQL'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List of Pending Items */}
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>SQLite Queue Empty</Text>
            <Text style={styles.emptySub}>
              All weight measurements have been uploaded to MySQL and local cache cleaned.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const getStatusTagStyle = (status: string) => {
  switch (status) {
    case 'Uploading': return { backgroundColor: '#BBDEFB' };
    case 'Failed': return { backgroundColor: '#FFCDD2' };
    default: return { backgroundColor: '#FFF9C4' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },
  backBtn: {
    padding: 8
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A237E'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A237E'
  },
  syncHeaderRow: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  syncAllBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  syncAllText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5
  },
  btnDisabled: {
    opacity: 0.5
  },
  listContent: {
    padding: 16,
    gap: 12
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10
  },
  cardLeft: {
    flex: 1
  },
  weightText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A237E'
  },
  unitText: {
    fontSize: 14,
    color: '#5C6BC0'
  },
  timeText: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 4
  },
  ocrText: {
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 2
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#37474F'
  },
  retryText: {
    fontSize: 11,
    color: '#90A4AE',
    marginTop: 4
  },
  deleteBtn: {
    marginTop: 8
  },
  deleteBtnText: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '600'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#37474F',
    marginBottom: 8
  },
  emptySub: {
    fontSize: 13,
    color: '#90A4AE',
    textAlign: 'center',
    lineHeight: 18
  }
});
