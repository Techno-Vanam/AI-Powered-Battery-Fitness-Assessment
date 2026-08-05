import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';

type Props = { title: string; subtitle?: string };

export default function SectionTitle({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={portalStyles.sectionHeader}>{title}</Text>
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
    marginBottom: 4,
  },
});
