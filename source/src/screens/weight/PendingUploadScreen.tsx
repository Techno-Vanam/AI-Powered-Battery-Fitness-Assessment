import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  RefreshCw,
  Scale,
  Clock,
  WifiOff,
  CheckCircle,
} from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import { colors, layout, roleColors } from '../../theme';
import { createScreenStyles } from '../../styles/screenStyles';
import { SQLiteService, WeightMeasurementRecord } from '../../services/SQLiteService';
import { SyncService } from '../../services/syncService';
import { NetworkService } from '../../services/NetworkService';


const screenStyles = createScreenStyles();
const accent = roleColors('athlete');

export const PendingUploadScreen = ({ navigation }: any) => {
  const [pendingList, setPendingList] = useState<WeightMeasurementRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const fetchPendingData = async () => {
    const list = SQLiteService.getPendingMeasurements();
    setPendingList(list);
    const online = await NetworkService.isConnected();
    setIsOnline(online);
  };

  useEffect(() => {
    fetchPendingData();

    const unsubSync = SyncService.subscribeToSyncEvents(() => {
      fetchPendingData();
    });

    return () => {
      unsubSync();
    };
  }, []);

  const handleRetryAll = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'Cannot retry upload while offline. Automatic synchronization will run when internet is restored.'
      );
      return;
    }

    setIsSyncing(true);
    const result = await SyncService.syncPendingRecords();
    await fetchPendingData();
    setIsSyncing(false);

    if (result.success && result.count > 0) {
      Alert.alert('Sync Successful', `${result.count} offline records uploaded successfully.`);
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return (
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ', ' +
        d.toLocaleDateString([], { month: 'short', day: 'numeric' })
      );
    } catch {
      return isoString;
    }
  };

  const renderItem = ({ item }: { item: WeightMeasurementRecord }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemHeaderLeft}>
          <View style={[styles.miniIconBox, { backgroundColor: accent.light }]}>
            <Scale size={layout.iconMd} color={accent.primary} />
          </View>
          <View style={styles.weightCol}>
            <AppText variant="h2" color={accent.primary}>
              {item.weight.toFixed(1)} kg
            </AppText>
            <View style={styles.timeRow}>
              <Clock size={12} color={colors.textMuted} />
              <AppText variant="caption" color={colors.textSecondary}>
                {formatTimestamp(item.timestamp)}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.statusCol}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  item.syncStatus === 'Uploading'
                    ? accent.light
                    : colors.warningBg,
              },
            ]}
          >
            {item.syncStatus === 'Uploading' ? (
              <ActivityIndicator size="small" color={accent.primary} />
            ) : (
              <WifiOff size={12} color={colors.warning} />
            )}
            <AppText
              variant="pill"
              color={
                item.syncStatus === 'Uploading'
                  ? accent.primary
                  : colors.warning
              }
            >
              {item.syncStatus}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textMuted}>
            Retries: {item.retryCount}
          </AppText>
        </View>
      </View>
    </View>
  );

  return (
    <Screen contentStyle={screenStyles.content}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ChevronLeft size={layout.iconMd} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>
          Pending Uploads
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      {/* Counter Summary */}
      <View style={styles.summaryBar}>
        <AppText variant="subtitle" color={colors.textSecondary}>
          Offline Cache: {pendingList.length} items
        </AppText>
        <TouchableOpacity
          style={[styles.retryBtn, (!isOnline || isSyncing) && styles.disabledBtn]}
          onPress={handleRetryAll}
          disabled={!isOnline || isSyncing}
          activeOpacity={0.8}
        >
          <RefreshCw size={14} color={colors.surface} />
          <AppText variant="pill" color={colors.surface}>
            {isSyncing ? 'Syncing...' : 'Retry Sync'}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* List or Empty State */}
      {pendingList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CheckCircle size={56} color={colors.success} />
          <AppText variant="h3" color={colors.textPrimary}>
            All Measurements Synced!
          </AppText>
          <AppText
            variant="bodySm"
            color={colors.textSecondary}
            style={styles.centeredText}
          >
            There are no offline weight records waiting to upload.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={pendingList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: layout.formGap,
  },
  backBtn: {
    padding: layout.fieldGap,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: layout.horizontalPadding,
    borderRadius: layout.radiusLg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: layout.formGap,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: accent.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.radiusSm,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  listContent: {
    gap: layout.fieldGap + 4,
    paddingBottom: layout.verticalPadding,
  },
  itemCard: {
    backgroundColor: colors.surface,
    padding: layout.horizontalPadding,
    borderRadius: layout.radiusLg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.horizontalPadding,
  },
  miniIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightCol: {
    gap: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: layout.radiusSm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: layout.fieldGap + 4,
    marginTop: 40,
  },
  centeredText: {
    textAlign: 'center',
    maxWidth: 260,
  },
});

export default PendingUploadScreen;
