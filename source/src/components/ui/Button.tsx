import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { colors, layout, roleColors, Role } from '../../theme';
import AppText from './AppText';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = Omit<TouchableOpacityProps, 'title' | 'role'> & {
  title: string;
  loading?: boolean;
  role?: Role;
  variant?: Variant;
  style?: ViewStyle;
};

export function Button({
  title,
  loading = false,
  role = 'athlete',
  variant = 'primary',
  disabled,
  style,
  ...props
}: Props) {
  const accent = roleColors(role);
  const isDisabled = disabled || loading;

  const buttonStyle =
    variant === 'primary'
      ? [styles.primary, { backgroundColor: accent.primary, shadowColor: accent.shadow }]
      : variant === 'danger'
        ? styles.danger
        : [styles.secondary, { borderColor: accent.primary }];

  const textColor =
    variant === 'primary'
      ? colors.surface
      : variant === 'danger'
        ? colors.error
        : accent.primary;

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[styles.base, buttonStyle, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.surface : accent.primary} />
      ) : (
        <AppText variant="button" color={textColor}>
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.buttonHeight,
    borderRadius: layout.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: layout.fieldGap,
  },
  primary: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
  },
  danger: {
    backgroundColor: colors.errorBg,
    borderWidth: 1.5,
    borderColor: colors.errorBorder,
  },
  disabled: {
    opacity: 0.55,
  },
});

export default Button;
