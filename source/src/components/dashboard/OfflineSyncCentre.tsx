import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';
import type { SyncCentreInfo } from '../../types/athleteDashboard';

type Props = {
  isOnline: boolean;
  sync: SyncCentreInfo;
  syncing?: boolean;
  onSyncNow: () => void;
};

export default function OfflineSyncCentre({ isOnline, sync, syncing, onSyncNow }: Props) {
  return (
    <View style={styles.card}>
      <SectionTitle title={t('dashboard.syncCentre')} />
      <View style={styles.statusRow}>
        {isOnline ? (
          <Wifi size={18} color={colors.success} />
        ) : (
          <WifiOff size={18} color={colors.error} />
        )}
        <AppText
          variant="bodySm"
          color={isOnline ? colors.success : colors.error}
        >
          {isOnline ? t('dashboard.online') : t('dashboard.offline')}
        </AppText>
      </View>

      <View style={styles.counts}>
        <AppText variant="caption" color={colors.textSecondary}>
          {t('dashboard.pendingVideos')}: {sync.pendingVideos}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {t('dashboard.pendingResults')}: {sync.pendingResults}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {t('dashboard.pendingReports')}: {sync.pendingReports}
        </AppText>
      </View>

      <AppText variant="caption" color={colors.textMuted}>
        {t('dashboard.lastSync')}:{' '}
        {sync.lastSyncAt ? new Date(sync.lastSyncAt).toLocaleString() : '—'}
      </AppText>

      <TouchableOpacity
        style={[styles.cta, syncing && styles.ctaDisabled]}
        onPress={onSyncNow}
        activeOpacity={0.85}
        disabled={syncing}
      >
        <AppText variant="button" color="#FFFFFF">
          {syncing ? 'Syncing…' : t('dashboard.syncNow')}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counts: { gap: 4 },
  cta: {
    marginTop: 4,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.7,
  },
});
