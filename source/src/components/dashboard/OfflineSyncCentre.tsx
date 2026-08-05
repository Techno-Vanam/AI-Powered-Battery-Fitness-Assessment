import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import SFSymbol from '../ui/SFSymbol';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { colors } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';
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
    <View style={[portalStyles.card, styles.card]}>
      <SectionTitle title={t('dashboard.syncCentre')} />
      <View style={styles.statusRow}>
        {isOnline ? (
          <SFSymbol name="wifi" size={18} color={colors.success} />
        ) : (
          <SFSymbol name="wifi.slash" size={18} color={colors.error} />
        )}
        <AppText variant="bodySm" color={isOnline ? colors.success : colors.error}>
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
        style={[portalStyles.ctaPrimary, styles.cta, syncing && styles.ctaDisabled]}
        onPress={onSyncNow}
        activeOpacity={0.85}
        disabled={syncing}
      >
        <AppText variant="button" color={colors.textInverse}>
          {syncing ? 'Syncing…' : t('dashboard.syncNow')}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counts: { gap: 4 },
  cta: {
    marginTop: 4,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
});
