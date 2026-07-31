import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { User, ClipboardList, LogOut } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import { createAuthStyles, createScreenStyles } from '../../styles/screenStyles';
import { colors, layout, roleColors } from '../../theme';

const authStyles = createAuthStyles('coach');
const screenStyles = createScreenStyles();
const accent = roleColors('coach');

const CoachHomeScreen = ({ navigation }: any) => {
  return (
    <Screen scroll contentStyle={screenStyles.centeredContent}>
      <View style={styles.header}>
        <View style={[screenStyles.avatar, { backgroundColor: accent.light }]}>
          <User size={layout.iconLg + 4} color={accent.primary} />
        </View>
        <AppText variant="h1" style={styles.welcome}>
          Welcome, Coach!
        </AppText>
        <AppText variant="subtitle" color={colors.textSecondary} style={styles.centered}>
          Your athlete management dashboard is coming soon.
        </AppText>
      </View>

      <View style={authStyles.card}>
        <ClipboardList size={layout.iconMd} color={accent.primary} />
        <AppText variant="h3">Athlete Assessments</AppText>
        <AppText variant="bodySm" color={colors.textSecondary} style={styles.centered}>
          Record and review battery fitness assessments for your athletes.
        </AppText>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] })}
        activeOpacity={0.85}
      >
        <LogOut size={layout.iconSm} color={colors.error} />
        <AppText variant="body" color={colors.error}>
          Log Out
        </AppText>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: layout.fieldGap + 2,
  },
  welcome: {
    fontSize: layout.inputHeight * 0.5,
  },
  centered: {
    textAlign: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.fieldGap,
    paddingVertical: layout.fieldGap + 4,
    paddingHorizontal: layout.horizontalPadding,
    borderRadius: layout.radiusSm,
    borderWidth: 1.5,
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorBg,
    marginTop: layout.fieldGap,
  },
});

export default CoachHomeScreen;
