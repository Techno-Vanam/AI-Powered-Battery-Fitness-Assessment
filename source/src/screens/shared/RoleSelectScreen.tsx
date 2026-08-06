import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User, Users, ChevronRight } from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import PortalHeader from '../../components/portal/PortalHeader';
import AppText from '../../components/ui/AppText';
import { colors, layout } from '../../theme';
import PortalScreen from '../../components/ui/PortalScreen';
import { createScreenStyles } from '../../styles/screenStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

const screenStyles = createScreenStyles();

const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <PortalScreen edges={['top', 'bottom', 'left', 'right']}>
      <PortalHeader greeting="Welcome to" title="Battery Fitness" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <AppText variant="h1" style={styles.title}>
            Choose Your Role
          </AppText>
          <AppText variant="subtitle" color={colors.textSecondary} style={styles.subtitle}>
            Sign in or create an account to continue
          </AppText>
        </View>

        <View style={styles.cardsStack}>
          <TouchableOpacity
            style={[screenStyles.roleCard, styles.roleCardAthlete]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AthleteLogin')}
          >
            <View style={[screenStyles.iconBox, styles.iconAthlete]}>
              <User size={28} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.roleTextCol}>
              <AppText variant="h3">Athlete</AppText>
              <AppText variant="bodySm" color={colors.textSecondary}>
                Track assessments, results, and progress
              </AppText>
            </View>
            <ChevronRight size={22} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[screenStyles.roleCard, styles.roleCardCoach]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CoachLogin')}
          >
            <View style={[screenStyles.iconBox, styles.iconCoach]}>
              <Users size={28} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <View style={styles.roleTextCol}>
              <AppText variant="h3" color={colors.textInverse}>
                Coach
              </AppText>
              <AppText variant="bodySm" color="rgba(255,255,255,0.85)">
                Manage athletes and run fitness tests
              </AppText>
            </View>
            <ChevronRight size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        <View style={styles.footerLinks}>
          <AppText variant="caption" color={colors.textMuted} style={styles.footerHint}>
            New here? Choose a role above — you can register from the login screen.
          </AppText>
        </View>
      </ScrollView>
    </PortalScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: layout.sectionGap,
    paddingBottom: layout.sectionGap * 2,
    gap: layout.formGap,
  },
  hero: {
    gap: layout.fieldGap,
    marginBottom: 8,
  },
  title: {
    letterSpacing: -0.5,
  },
  subtitle: {
    lineHeight: 22,
  },
  cardsStack: {
    gap: 14,
  },
  roleCardAthlete: {
    borderColor: colors.warningBorder,
    backgroundColor: colors.surface,
  },
  roleCardCoach: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  iconAthlete: {
    backgroundColor: colors.primaryLight,
  },
  iconCoach: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  roleTextCol: {
    flex: 1,
    gap: 4,
  },
  footerLinks: {
    marginTop: layout.sectionGap,
    alignItems: 'center',
  },
  footerHint: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default RoleSelectScreen;
