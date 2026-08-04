import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { colors, layout } from '../../theme';
import { fontFamily } from '../../theme/fonts';
import type { ProgressInfo } from '../../types/athleteDashboard';

type Props = {
  name: string;
  progress: ProgressInfo;
  statusLabel: string;
};

function greetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function ScoreHero({ name, progress, statusLabel }: Props) {
  const [hidden, setHidden] = useState(false);
  const prefix = greetingPrefix();
  const firstName = name.split(' ')[0] || name;

  return (
    <View style={styles.wrap}>
      <AppText variant="bodySm" color={colors.textSecondary}>
        {prefix}, {firstName}
      </AppText>
      <AppText variant="caption" color={colors.textMuted} style={styles.label}>
        Overall progress
      </AppText>
      <View style={styles.valueRow}>
        <AppText style={styles.value}>
          {hidden ? '••••' : `${progress.percent}%`}
        </AppText>
        <TouchableOpacity
          onPress={() => setHidden(v => !v)}
          hitSlop={12}
          style={styles.eye}
        >
          {hidden ? (
            <EyeOff size={22} color={colors.textMuted} />
          ) : (
            <Eye size={22} color={colors.textMuted} />
          )}
        </TouchableOpacity>
      </View>
      <AppText variant="caption" color={colors.textSecondary}>
        {statusLabel} · {progress.completed}/{progress.completed + progress.remaining} tests
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
    paddingTop: layout.fieldGap,
  },
  label: {
    marginTop: 10,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  value: {
    fontFamily: fontFamily('800'),
    fontSize: 42,
    lineHeight: 50,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  eye: {
    padding: 4,
  },
});
