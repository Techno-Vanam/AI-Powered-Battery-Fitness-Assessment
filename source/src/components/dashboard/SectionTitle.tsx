import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../ui/AppText';
import { colors } from '../../theme';

type Props = { title: string; subtitle?: string };

export default function SectionTitle({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" color={colors.textSecondary}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 2,
    marginBottom: 12,
  },
  title: {
    letterSpacing: -0.2,
  },
});
