import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import SFSymbol from '../ui/SFSymbol';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { colors } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';
import { t } from '../../utils/i18n';

type Props = {
  onViewPdf: () => void;
  onDownload: () => Promise<void> | void;
  onShare: () => void;
};

export default function DigitalReportCard({ onViewPdf, onDownload, onShare }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPress = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await onDownload();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={[portalStyles.card, styles.card]}>
      <SectionTitle title={t('dashboard.digitalReport')} />
      <View style={styles.row}>
        <TouchableOpacity style={styles.action} onPress={onViewPdf} activeOpacity={0.85}>
          <View style={styles.circle}>
            <SFSymbol name="eye" size={18} color={colors.primary} />
          </View>
          <AppText variant="caption" color={colors.textLabel}>
            {t('dashboard.viewPdf')}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={handleDownloadPress}
          activeOpacity={0.85}
          disabled={downloading}
        >
          <View style={[styles.circle, downloading && styles.circleActive]}>
            {downloading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <SFSymbol name="arrow.down.doc" size={18} color={colors.primary} />
            )}
          </View>
          <AppText variant="caption" color={downloading ? colors.primary : colors.textLabel}>
            {downloading ? 'Saving...' : t('dashboard.download')}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={onShare} activeOpacity={0.85}>
          <View style={styles.circle}>
            <SFSymbol name="square.and.arrow.up" size={18} color={colors.primary} />
          </View>
          <AppText variant="caption" color={colors.textLabel}>
            {t('dashboard.share')}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  action: {
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  circleActive: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
  },
});
