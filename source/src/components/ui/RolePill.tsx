import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, layout, roleColors, Role } from '../../theme';
import AppText from './AppText';

type Props = {
  role: Role;
  label?: string;
};

export function RolePill({ role, label }: Props) {
  const accent = roleColors(role);
  const text =
    label ?? (role === 'athlete' ? 'Logging in as Athlete' : 'Logging in as Coach');

  return (
    <View style={[styles.pill, { backgroundColor: accent.light }]}>
      <AppText variant="pill" color={accent.primary}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: layout.radiusXl,
    paddingHorizontal: layout.fieldGap + 4,
    paddingVertical: 5,
  },
});

export default RolePill;
