import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ClipboardCheck, BarChart3, FileText } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export type AthleteTab = 'home' | 'assessments' | 'results' | 'reports';

type Props = {
  active: AthleteTab;
  onChange: (tab: AthleteTab) => void;
};

interface TabConfig {
  key: AthleteTab;
  label: string;
  Icon: React.ComponentType<{ color: string; size: number }>;
}

const TABS: TabConfig[] = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'assessments', label: 'Assess', Icon: ClipboardCheck },
  { key: 'results', label: 'Results', Icon: BarChart3 },
  { key: 'reports', label: 'Reports', Icon: FileText },
];

export default function AthleteBottomNav({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const bottomPosition = Math.max(insets.bottom + 6, 12);

  return (
    <View style={[styles.floatingWrapper, { bottom: bottomPosition }]} pointerEvents="box-none">
      <View style={styles.container}>
        {TABS.map(tab => {
          const isSelected = active === tab.key;
          const color = isSelected ? colors.primary : colors.textSecondary;
          const IconComponent = tab.Icon;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              style={[styles.tabItem, isSelected && styles.tabItemActive]}
              onPress={() => onChange(tab.key)}
            >
              <View style={[styles.iconPill, isSelected && styles.iconPillActive]}>
                <IconComponent color={color} size={20} />
              </View>
              <Text style={[styles.tabLabel, { color }, isSelected && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    height: 62,
    backgroundColor: '#FFFFFF',
    borderRadius: 31,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 24,
  },
  tabItemActive: {
    backgroundColor: colors.primaryLight,
  },
  iconPill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: colors.primary,
  },
});
