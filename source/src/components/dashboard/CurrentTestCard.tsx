import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';
import { t } from '../../utils/i18n';
import type { CurrentTestInfo } from '../../types/athleteDashboard';

type Props = {
  currentTest: CurrentTestInfo;
  onContinue: () => void;
};

export default function CurrentTestCard({ currentTest, onContinue }: Props) {
  if (!currentTest) return null;

  return (
    <View style={[portalStyles.card, styles.card]}>
      <Text style={portalStyles.sectionHeader}>{t('dashboard.currentTest')}</Text>
      <View style={styles.infoRow}>
        <View style={styles.textGroup}>
          <AppText variant="h3" style={styles.testName}>{currentTest.name}</AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.statusText}>
            Status: {currentTest.status.replace('_', ' ')}
          </AppText>
        </View>
        <TouchableOpacity style={portalStyles.ctaPrimary} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{t('dashboard.continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.warningBorder,
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
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse,
  },
});
