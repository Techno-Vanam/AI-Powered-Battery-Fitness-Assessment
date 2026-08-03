import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Scale,
  Wifi,
  WifiOff,
  Clock,
  ArrowRight,
  RefreshCw,
  Camera as CameraIcon,
  ChevronLeft,
} from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import { colors, layout, roleColors } from '../../theme';
import { createScreenStyles } from '../../styles/screenStyles';
import { NetworkService } from '../../services/NetworkService';
import { SQLiteService } from '../../services/SQLiteService';
import { SyncService } from '../../services/syncService';


const screenStyles = createScreenStyles();
const accent = roleColors('athlete');

export const WeightMeasurementScreen = ({ navigation }: any) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastWeight, setLastWeight] = useState<number | null>(null);
  const [lastTime, setLastTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const loadDashboardData = async () => {
    const online = await NetworkService.isConnected();
    setIsOnline(online);
    setPendingCount(SQLiteService.getPendingCount());

    const lastRecord = SQLiteService.getLastMeasurement();
    if (lastRecord) {
      setLastWeight(lastRecord.weight);
      setLastTime(lastRecord.timestamp);
    } else {
      setLastWeight(null);
      setLastTime(null);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Subscribe to network changes
    const unsubNet = NetworkService.subscribe((online) => {
      setIsOnline(online);
      if (online) {
        SyncService.syncPendingRecords();
      }
    });

    // Subscribe to auto-sync completion events
    const unsubSync = SyncService.subscribeToSyncEvents(() => {
      loadDashboardData();
    });

    const unsubscribeFocus = navigation.addListener('focus', () => {
      loadDashboardData();
    });

    return () => {
      unsubNet();
      unsubSync();
      unsubscribeFocus();
    };
  }, [navigation]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await SyncService.syncPendingRecords();
    await loadDashboardData();
    setIsSyncing(false);
  };

  const formatTimestamp = (isoString: string | null) => {
    if (!isoString) return 'No measurements recorded';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ', ' +
        d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <Screen scroll contentStyle={screenStyles.content}>
      {/* Top Header Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ChevronLeft size={layout.iconMd} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>
          Weight Measurement
        </AppText>
        <TouchableOpacity
          style={styles.syncIconBtn}
          onPress={handleManualSync}
          disabled={isSyncing || !isOnline}
          activeOpacity={0.8}
        >
          <RefreshCw
            size={layout.iconSm + 2}
            color={isOnline ? accent.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Network Status Badge */}
      <View style={styles.statusCard}>
        <View style={styles.statusLeft}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isOnline ? colors.successBg : colors.warningBg },
            ]}
          >
            {isOnline ? (
              <Wifi size={layout.iconSm} color={colors.success} />
            ) : (
              <WifiOff size={layout.iconSm} color={colors.warning} />
            )}
            <AppText
              variant="pill"
              color={isOnline ? colors.success : colors.warning}
              style={styles.statusText}
            >
              {isOnline ? 'Online Mode' : 'Offline Mode'}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.textSecondary}>
            {isOnline
              ? 'Measurements upload immediately'
              : 'Saving temporarily in local SQLite'}
          </AppText>
        </View>

        {/* Pending Counter Pill */}
        {pendingCount > 0 && (
          <TouchableOpacity
            style={styles.pendingBadge}
            onPress={() => navigation.navigate('WeightPendingUploads')}
            activeOpacity={0.85}
          >
            <AppText variant="pill" color={colors.warning}>
              {pendingCount} Pending
            </AppText>
            <ArrowRight size={14} color={colors.warning} />
          </TouchableOpacity>
        )}
      </View>

      {/* Last Measurement Card */}
      <View style={styles.dashboardCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: accent.light }]}>
            <Scale size={layout.iconLg} color={accent.primary} />
          </View>
          <View style={styles.headerTextCol}>
            <AppText variant="subtitle" color={colors.textSecondary}>
              Last Measured Weight
            </AppText>
            <AppText variant="h1" style={styles.weightValueText}>
              {lastWeight !== null ? `${lastWeight.toFixed(1)} kg` : '--.- kg'}
            </AppText>
          </View>
        </View>

        <View style={styles.timeRow}>
          <Clock size={layout.iconSm} color={colors.textMuted} />
          <AppText variant="caption" color={colors.textSecondary}>
            {formatTimestamp(lastTime)}
          </AppText>
        </View>
      </View>

      {/* Pending Uploads Card Link if any exist */}
      {pendingCount > 0 && (
        <TouchableOpacity
          style={styles.pendingCard}
          onPress={() => navigation.navigate('WeightPendingUploads')}
          activeOpacity={0.85}
        >
          <View style={styles.pendingCardLeft}>
            <RefreshCw size={layout.iconMd} color={colors.warning} />
            <View>
              <AppText variant="h3">Pending Uploads ({pendingCount})</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Records waiting for internet sync
              </AppText>
            </View>
          </View>
          <ChevronLeft
            size={layout.iconMd}
            color={colors.textSecondary}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </TouchableOpacity>
      )}

      {/* Action CTA Button */}
      <View style={styles.ctaWrapper}>
        <Button
          title="Scan Weight"
          role="athlete"
          variant="primary"
          onPress={() => navigation.navigate('WeightLiveScanner')}
          style={styles.captureBtn}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: layout.sectionGap - 8,
  },
  backBtn: {
    padding: layout.fieldGap,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  syncIconBtn: {
    padding: layout.fieldGap,
  },
  statusCard: {
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
  statusLeft: {
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: layout.radiusSm,
    alignSelf: 'flex-start',
  },
  statusText: {
    textTransform: 'uppercase',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.radiusSm,
  },
  dashboardCard: {
    backgroundColor: colors.surface,
    padding: layout.horizontalPadding + 4,
    borderRadius: layout.radiusXl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: accent.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: layout.formGap,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.horizontalPadding,
    marginBottom: layout.formGap,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextCol: {
    gap: 4,
  },
  weightValueText: {
    color: accent.primary,
    fontSize: layout.inputHeight * 0.75,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: layout.fieldGap + 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    padding: layout.horizontalPadding,
    borderRadius: layout.radiusLg,
    marginBottom: layout.formGap,
  },
  pendingCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.horizontalPadding,
  },
  ctaWrapper: {
    marginTop: layout.sectionGap,
  },
  captureBtn: {
    height: layout.buttonHeight + 4,
  },
});

export default WeightMeasurementScreen;
