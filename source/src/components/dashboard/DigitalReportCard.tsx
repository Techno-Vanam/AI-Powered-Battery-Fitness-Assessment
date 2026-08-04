import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Download, Eye, Share2 } from 'lucide-react-native';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';

type Props = {
  onViewPdf: () => void;
  onDownload: () => void;
  onShare: () => void;
};

export default function DigitalReportCard({ onViewPdf, onDownload, onShare }: Props) {
  return (
    <View style={styles.card}>
      <SectionTitle title={t('dashboard.digitalReport')} />
      <View style={styles.row}>
        <TouchableOpacity style={styles.action} onPress={onViewPdf} activeOpacity={0.85}>
          <View style={styles.circle}>
            <Eye size={18} color={colors.textPrimary} />
          </View>
          <AppText variant="caption" color={colors.textLabel}>
            {t('dashboard.viewPdf')}
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={onDownload} activeOpacity={0.85}>
          <View style={styles.circle}>
            <Download size={18} color={colors.textPrimary} />
          </View>
          <AppText variant="caption" color={colors.textLabel}>
            {t('dashboard.download')}
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={onShare} activeOpacity={0.85}>
          <View style={styles.circle}>
            <Share2 size={18} color={colors.textPrimary} />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  action: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
