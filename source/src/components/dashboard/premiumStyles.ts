import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

/** Shared portal card look aligned with coach dashboard. */
export const premium = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...layout.shadowSubtle,
  },
  softCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: layout.cardRadius,
    padding: 16,
  },
  sectionGap: {
    marginBottom: 4,
  },
});

export const premiumColors = {
  dock: colors.primary,
  mutedIcon: colors.textMuted,
  hairline: colors.border,
  circleBorder: colors.border,
  cards: ['#007AFF', '#5856D6', '#FF9500', '#34C759'] as const,
};
