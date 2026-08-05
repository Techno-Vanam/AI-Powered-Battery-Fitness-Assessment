import { StyleSheet } from 'react-native';

/** Shared premium card look (fintech reference) */
export const premium = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  softCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    padding: 16,
  },
  sectionGap: {
    marginBottom: 4,
  },
});

export const premiumColors = {
  dock: '#111827',
  mutedIcon: '#9CA3AF',
  hairline: 'rgba(60,60,67,0.18)',
  circleBorder: '#E5E7EB',
  cards: ['#6C63FF', '#5B9DFF', '#2EC4A6', '#FF8A4C'] as const,
};
