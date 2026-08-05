import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, ClipboardCheck, BarChart3, Settings } from 'lucide-react-native';
import { useApp, MainTabType } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { colors } from '../../theme/colors';

interface BottomTabBarProps {
  onTabPress?: (tab: MainTabType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ onTabPress }) => {
  const { selectedTab, setSelectedTab } = useApp();
  const t = useTranslation();
  const insets = useSafeAreaInsets();

  // Dynamically position tab bar above Android 3-button navigation or gesture bar
  const bottomPosition = Math.max(insets.bottom + 6, 12);

  const tabs: { key: MainTabType; label: string; icon: React.ComponentType<{ color: string; size: number }> }[] = [
    { key: 'Home',     label: t('tab_home'),     icon: Home },
    { key: 'Athletes', label: t('tab_athletes'), icon: Users },
    { key: 'Assess',   label: t('tab_assess'),   icon: ClipboardCheck },
    { key: 'Reports',  label: t('tab_reports'),  icon: BarChart3 },
    { key: 'Settings', label: t('tab_settings'), icon: Settings },
  ];

  const handlePress = (key: MainTabType) => {
    setSelectedTab(key);
    if (onTabPress) {
      onTabPress(key);
    }
  };

  return (
    <View style={[styles.floatingWrapper, { bottom: bottomPosition }]}>
      <View style={styles.container}>
        {tabs.map(tab => {
          const isSelected = selectedTab === tab.key;
          const color = isSelected ? colors.primary : colors.textSecondary;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              style={[styles.tabItem, isSelected && styles.tabItemActive]}
              onPress={() => handlePress(tab.key)}
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
};

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
    borderRadius: 31, // Rounded floating rectangle / oval capsule shape
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    // Apple soft floating shadow
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
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: colors.primary,
  },
});
