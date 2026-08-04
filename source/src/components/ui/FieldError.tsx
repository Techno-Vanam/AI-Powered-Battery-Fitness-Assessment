import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { colors, layout } from '../../theme';
import AppText from './AppText';

type Props = { message?: string };

export function FieldError({ message }: Props) {
  if (!message) return null;
  return (
    <View style={styles.row}>
      <AlertCircle size={layout.iconSm - 6} color={colors.error} />
      <AppText variant="caption" color={colors.error}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
});

export default FieldError;
