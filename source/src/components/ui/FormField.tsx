import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, layout, roleColors, Role } from '../../theme';
import AppText from './AppText';
import FieldError from './FieldError';

type Props = {
  label: string;
  error?: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function FormField({ label, error, children, style }: Props) {
  return (
    <View style={[styles.group, style]}>
      <AppText variant="label" color={colors.textLabel}>
        {label}
      </AppText>
      {children}
      <FieldError message={error} />
    </View>
  );
}

type InputRowProps = {
  hasError?: boolean;
  children: React.ReactNode;
};

export function InputRow({ hasError, children }: InputRowProps) {
  return (
    <View style={[styles.inputRow, hasError && styles.inputError]}>
      {children}
    </View>
  );
}

export function AuthHeader({
  role,
  title,
  subtitle,
  badge,
}: {
  role?: Role;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
}) {
  const accent = role ? roleColors(role) : null;

  return (
    <View style={styles.header}>
      {role && <RolePillInline role={role} />}
      <AppText variant="h1" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="subtitle" color={colors.textSecondary}>
        {subtitle}
      </AppText>
      {badge}
    </View>
  );
}

function RolePillInline({ role }: { role: Role }) {
  const accent = roleColors(role);
  const text = role === 'athlete' ? 'Logging in as Athlete' : 'Logging in as Coach';
  return (
    <View style={[styles.pill, { backgroundColor: accent.light }]}>
      <AppText variant="pill" color={accent.primary}>
        {text}
      </AppText>
    </View>
  );
}

export function AuthFooter({
  text,
  linkText,
  onPress,
  role = 'athlete',
}: {
  text: string;
  linkText: string;
  onPress: () => void;
  role?: Role;
}) {
  const accent = roleColors(role);
  return (
    <View style={styles.footer}>
      <AppText variant="bodySm" color={colors.textSecondary}>
        {text}
      </AppText>
      <TouchableOpacity onPress={onPress}>
        <AppText variant="bodySm" color={accent.primary}>
          {linkText}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: layout.fieldGap - 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.fieldGap + 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radiusMd,
    paddingHorizontal: layout.fieldGap + 6,
    height: layout.inputHeight,
  },
  inputError: {
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorBg,
  },
  header: {
    marginBottom: layout.sectionGap,
    gap: layout.fieldGap + 2,
  },
  title: {
    marginTop: 2,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: layout.radiusXl,
    paddingHorizontal: layout.fieldGap + 4,
    paddingVertical: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: layout.fieldGap,
    gap: 4,
  },
});

export default FormField;
