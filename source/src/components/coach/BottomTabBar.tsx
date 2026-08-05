import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, ClipboardList, Users, BarChart3, User } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export type TabKey = 'Home' | 'Assessments' | 'Athletes' | 'Analytics' | 'Profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs: { key: TabKey; label: string; icon: (color: string) => React.ReactNode }[] = [
    { key: 'Home', label: 'Home', icon: (color) => <Home size={22} color={color} /> },
    { key: 'Assessments', label: 'Assessments', icon: (color) => <ClipboardList size={22} color={color} /> },
    { key: 'Athletes', label: 'Athletes', icon: (color) => <Users size={22} color={color} /> },
    { key: 'Analytics', label: 'Analytics', icon: (color) => <BarChart3 size={22} color={color} /> },
    { key: 'Profile', label: 'Profile', icon: (color) => <User size={22} color={color} /> },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const color = isActive ? colors.primary : '#64748B';
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              {tab.icon(color)}
            </View>
            <Text style={[styles.label, { color, fontWeight: isActive ? '700' : '500' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 12,
  },
  activeIconWrapper: {
    backgroundColor: '#FFF5E6',
  },
  label: {
    fontSize: 10,
  },
});
