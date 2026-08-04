export const colors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textLabel: '#334155',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  error: '#EF4444',
  errorBorder: '#FCA5A5',
  errorBg: '#FFF5F5',
  success: '#15803D',
  successBg: '#F0FDF4',
  successBorder: '#86EFAC',
  warning: '#92400E',
  warningBg: '#FEF3C7',
  warningBorder: '#F59E0B',
  athlete: {
    primary: '#4F46E5',
    light: '#EEF2FF',
    shadow: '#4F46E5',
  },
  coach: {
    primary: '#7C3AED',
    light: '#F5F3FF',
    shadow: '#7C3AED',
    accent: '#059669',
    accentLight: '#ECFDF5',
  },
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export type Role = 'athlete' | 'coach';

export function roleColors(role: Role) {
  return role === 'athlete' ? colors.athlete : colors.coach;
}
