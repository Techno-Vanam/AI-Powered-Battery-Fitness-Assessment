import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ClipboardCheck, BarChart3, FileText } from 'lucide-react-native';
import { bottomInsetPadding } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';
import { colors } from '../../theme/colors';

export type AthleteTab = 'home' | 'assessments' | 'results' | 'reports';

type Props = {
  active: AthleteTab;
  onChange: (tab: AthleteTab) => void;
};

interface TabConfig {
  key: AthleteTab;
  label: string;
  icon: (color: string) => React.ReactNode;
}

const TABS: TabConfig[] = [
  { key: 'home', label: 'Home', icon: color => <Home size={22} color={color} /> },
  { key: 'assessments', label: 'Assess', icon: color => <ClipboardCheck size={22} color={color} /> },
  { key: 'results', label: 'Results', icon: color => <BarChart3 size={22} color={color} /> },
  { key: 'reports', label: 'Reports', icon: color => <FileText size={22} color={color} /> },
];

/** Athlete bottom nav — matches coach portal tab bar styling. */
export default function AthleteBottomNav({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[portalStyles.tabBar, { paddingBottom: bottomInsetPadding(insets.bottom, 12) }]}>
      {TABS.map(tab => {
        const isActive = active === tab.key;
        const color = isActive ? colors.primary : colors.textMuted;

        return (
          <TouchableOpacity
            key={tab.key}
            style={portalStyles.tabItem}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[portalStyles.tabIconWrapper, isActive && portalStyles.tabIconWrapperActive]}>
              {tab.icon(color)}
            </View>
            <Text style={[portalStyles.tabLabel, { color, fontWeight: isActive ? '700' : '500' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

