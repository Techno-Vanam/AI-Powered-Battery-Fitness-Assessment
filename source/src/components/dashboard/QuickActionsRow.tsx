import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ClipboardList, History, FileText, Play, BarChart3,
} from 'lucide-react-native';
import QuickActionButton from './QuickActionButton';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';

type Props = {
  onContinue: () => void;
  onStart: () => void;
  onResults: () => void;
  onReport: () => void;
  onHistory: () => void;
};

export default function QuickActionsRow({
  onContinue,
  onStart,
  onResults,
  onReport,
  onHistory,
}: Props) {
  return (
    <View>
      <AppText variant="h3" style={styles.title}>
        {t('dashboard.quickActions')}
      </AppText>
      <View style={styles.row}>
        <QuickActionButton
          label={t('dashboard.continue')}
          icon={<Play size={20} color={colors.textPrimary} />}
          onPress={onContinue}
        />
        <QuickActionButton
          label={t('dashboard.start')}
          icon={<ClipboardList size={20} color={colors.textPrimary} />}
          onPress={onStart}
        />
        <QuickActionButton
          label={t('dashboard.viewResults')}
          icon={<BarChart3 size={20} color={colors.textPrimary} />}
          onPress={onResults}
        />
        <QuickActionButton
          label={t('dashboard.viewReport')}
          icon={<FileText size={20} color={colors.textPrimary} />}
          onPress={onReport}
        />
        <QuickActionButton
          label={t('dashboard.assessmentHistory')}
          icon={<History size={20} color={colors.textPrimary} />}
          onPress={onHistory}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
