import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ChartColumnIncreasing,
  CircleUserRound,
  House,
  ListChecks,
  Plus,
  ScrollText,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AthleteTab = 'home' | 'assessments' | 'results' | 'reports' | 'profile';

type Props = {
  active: AthleteTab;
  onChange: (tab: AthleteTab) => void;
  onCenterPress?: () => void;
};

type TabItem = {
  key: AthleteTab;
  Icon: typeof House;
};

const LEFT: TabItem[] = [
  { key: 'home', Icon: House },
  { key: 'assessments', Icon: ListChecks },
];

const RIGHT: TabItem[] = [
  { key: 'results', Icon: ChartColumnIncreasing },
  { key: 'reports', Icon: ScrollText },
  { key: 'profile', Icon: CircleUserRound },
];

export default function AthleteBottomNav({ active, onChange, onCenterPress }: Props) {
  const insets = useSafeAreaInsets();

  const renderTab = ({ key, Icon }: TabItem) => {
    const isActive = active === key;
    return (
      <TouchableOpacity
        key={key}
        style={styles.item}
        onPress={() => onChange(key)}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Icon
          size={24}
          color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.42)'}
          strokeWidth={isActive ? 2.15 : 1.75}
          fill={isActive ? 'rgba(255,255,255,0.18)' : 'transparent'}
        />
        {isActive ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.dock}>
        {LEFT.map(renderTab)}

        <TouchableOpacity
          style={styles.centerBtn}
          onPress={() => {
            if (onCenterPress) onCenterPress();
            else onChange('assessments');
          }}
          activeOpacity={0.88}
          accessibilityRole="button"
        >
          <View style={styles.centerInner}>
            <Plus size={28} color="#111827" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>

        {RIGHT.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    alignItems: 'center',
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0B0F',
    borderRadius: 36,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
    maxWidth: 400,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 16,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    gap: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  dotSpacer: {
    width: 4,
    height: 4,
  },
  centerBtn: {
    marginHorizontal: 6,
    marginTop: -26,
  },
  centerInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#0B0B0F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
});
