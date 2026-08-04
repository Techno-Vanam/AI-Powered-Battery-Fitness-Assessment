import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Award } from 'lucide-react-native';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';
import type { Achievement } from '../../types/athleteDashboard';

type Props = { achievements: Achievement[] };

const ACCENTS = ['#6C63FF', '#5B9DFF', '#2EC4A6', '#FF8A4C'];

export default function AchievementsRow({ achievements }: Props) {
  if (!achievements.length) return null;

  return (
    <View>
      <SectionTitle title={t('dashboard.achievements')} />
      <View style={styles.list}>
        {achievements.map((badge, index) => {
          const accent = ACCENTS[index % ACCENTS.length];
          return (
            <View key={badge.id} style={styles.badge}>
              <View style={[styles.icon, { backgroundColor: accent }]}>
                <Award size={18} color="#FFFFFF" />
              </View>
              <View style={styles.text}>
                <AppText variant="bodySm" numberOfLines={1}>
                  {badge.name}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
                  {badge.description}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
