import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ClipboardList, Users, BarChart3, User } from 'lucide-react-native';
import { bottomInsetPadding, colors } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';

export type TabKey = 'Home' | 'Assessments' | 'Athletes' | 'Analytics' | 'Profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();
  const tabs: { key: TabKey; label: string; icon: (color: string) => React.ReactNode }[] = [
    { key: 'Home', label: 'Home', icon: color => <Home size={22} color={color} /> },
    { key: 'Assessments', label: 'Assess', icon: color => <ClipboardList size={22} color={color} /> },
    { key: 'Athletes', label: 'Athletes', icon: color => <Users size={22} color={color} /> },
    { key: 'Analytics', label: 'Reports', icon: color => <BarChart3 size={22} color={color} /> },
    { key: 'Profile', label: 'Profile', icon: color => <User size={22} color={color} /> },
  ];

  return (
    <View style={[portalStyles.tabBar, { paddingBottom: bottomInsetPadding(insets.bottom, 12) }]}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        const color = isActive ? colors.primary : colors.textMuted;

        return (
          <TouchableOpacity
            key={tab.key}
            style={portalStyles.tabItem}
            onPress={() => onSelectTab(tab.key)}
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
};
