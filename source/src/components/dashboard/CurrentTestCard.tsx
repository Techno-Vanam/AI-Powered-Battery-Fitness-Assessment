import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';
import type { CurrentTestInfo } from '../../types/athleteDashboard';

type Props = {
  currentTest: CurrentTestInfo;
  onContinue: () => void;
};

export default function CurrentTestCard({ currentTest, onContinue }: Props) {
  if (!currentTest) return null;

  return (
    <View style={styles.card}>
      <SectionTitle title={t('dashboard.currentTest')} />
      <View style={styles.infoRow}>
        <View style={styles.textGroup}>
          <AppText variant="h3" style={styles.testName}>{currentTest.name}</AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.statusText}>
            Status: {currentTest.status.replace('_', ' ')}
          </AppText>
        </View>
        <TouchableOpacity style={styles.cta} onPress={onContinue} activeOpacity={0.85}>
          <AppText variant="button" color="#FFFFFF" style={styles.ctaText}>
            {t('dashboard.continue')}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  testName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusText: {
    textTransform: 'capitalize',
    fontSize: 13,
  },
  cta: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 21,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
