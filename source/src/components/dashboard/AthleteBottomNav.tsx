import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import SFSymbol, { SFSymbolName } from '../ui/SFSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AthleteTab = 'home' | 'assessments' | 'results' | 'reports';

type Props = {
  active: AthleteTab;
  onChange: (tab: AthleteTab) => void;
};

type TabItem = {
  key: AthleteTab;
  symbol: SFSymbolName;
  activeSymbol: SFSymbolName;
};

const TABS: TabItem[] = [
  { key: 'home', symbol: 'house', activeSymbol: 'house.fill' },
  { key: 'assessments', symbol: 'list.bullet.rectangle', activeSymbol: 'list.bullet.rectangle' },
  { key: 'results', symbol: 'chart.bar', activeSymbol: 'chart.bar.fill' },
  { key: 'reports', symbol: 'doc.text', activeSymbol: 'doc.text.fill' },
];

export default function AthleteBottomNav({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();

  const renderTab = ({ key, symbol, activeSymbol }: TabItem) => {
    const isActive = active === key;
    return (
      <TouchableOpacity
        key={key}
        style={styles.item}
        onPress={() => onChange(key)}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <SFSymbol
          name={isActive ? activeSymbol : symbol}
          size={24}
          color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.42)'}
          strokeWidth={isActive ? 2.2 : 1.75}
        />
        {isActive ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.dock}>
        {TABS.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 0,
    alignItems: 'center',
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0B0B0F',
    borderRadius: 36,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    maxWidth: 380,
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
});
