import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Plus, Users } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  type: 'add' | 'view';
  onPress: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, subtitle, type, onPress }) => {
  const isAdd = type === 'add';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.card,
        isAdd ? styles.cardAdd : styles.cardView,
        layout.shadowSubtle,
      ]}
      onPress={onPress}
    >
      <View style={styles.contentLeft}>
        <Text style={[styles.title, isAdd ? styles.titleWhite : styles.titleOrange]}>{title}</Text>
        <Text style={[styles.subtitle, isAdd ? styles.subWhite : styles.subOrange]}>{subtitle}</Text>
      </View>
      <View style={[styles.iconCircle, isAdd ? styles.iconCircleWhite : styles.iconCircleOrange]}>
        {isAdd ? (
          <Plus size={22} color={colors.primary} />
        ) : (
          <Users size={22} color={colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: layout.cardRadius,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },
  cardAdd: {
    backgroundColor: colors.primary, // Main Vibrant Orange #FF9500
    borderWidth: 0,
  },
  cardView: {
    backgroundColor: colors.primaryLight, // #FFF5E6
    borderWidth: 1,
    borderColor: '#FFD699',
  },
  contentLeft: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  titleWhite: {
    color: '#FFFFFF',
  },
  titleOrange: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: 13,
  },
  subWhite: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  subOrange: {
    color: colors.textSecondary,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  iconCircleWhite: {
    backgroundColor: '#FFFFFF',
  },
  iconCircleOrange: {
    backgroundColor: '#FFFFFF',
  },
});
