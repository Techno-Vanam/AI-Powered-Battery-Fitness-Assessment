import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Activity, Timer, Wind, Zap } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { colors, layout } from '../../theme';
import { fontFamily } from '../../theme/fonts';
import type { AccuracyItem } from '../../types/athleteDashboard';

type Props = {
  items: AccuracyItem[];
  onOpen?: (category: string) => void;
};

const PALETTE = [
  { bg: '#6C63FF', Icon: Zap },
  { bg: '#5B9DFF', Icon: Activity },
  { bg: '#2EC4A6', Icon: Wind },
  { bg: '#FF8A4C', Icon: Timer },
];

const PREFERRED = ['Speed', 'Power', 'Flexibility', 'Endurance', 'Agility', 'Anthropometry'];

export default function CategoryGrid({ items, onOpen }: Props) {
  const sorted = [...items].sort((a, b) => {
    const ai = PREFERRED.indexOf(a.category);
    const bi = PREFERRED.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const cards = (sorted.length
    ? sorted
    : [
        { category: 'Speed', confidence: 93 },
        { category: 'Power', confidence: 90 },
        { category: 'Flexibility', confidence: 88 },
        { category: 'Endurance', confidence: 0 },
      ]
  ).slice(0, 4);

  return (
    <View>
      <View style={styles.header}>
        <AppText variant="h3">Quick actions</AppText>
      </View>
      <View style={styles.grid}>
        {cards.map((card, index) => {
          const { bg, Icon } = PALETTE[index % PALETTE.length];
          return (
            <TouchableOpacity
              key={card.category}
              style={[styles.card, { backgroundColor: bg }]}
              activeOpacity={0.9}
              onPress={() => onOpen?.(card.category)}
            >
              <View style={styles.blob} />
              <View style={styles.iconWrap}>
                <Icon size={18} color="#FFFFFF" />
              </View>
              <AppText variant="bodySm" color="#FFFFFF" style={styles.title}>
                {card.category}
              </AppText>
              <AppText style={styles.value} color="#FFFFFF">
                {card.confidence > 0 ? `${card.confidence}%` : '—'}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: layout.fieldGap + 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47.5%',
    flexGrow: 1,
    minHeight: 132,
    borderRadius: 22,
    padding: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    gap: 4,
  },
  blob: {
    position: 'absolute',
    top: -18,
    right: -10,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 10,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    opacity: 0.95,
  },
  value: {
    fontFamily: fontFamily('800'),
    fontSize: 26,
    lineHeight: 32,
  },
});
