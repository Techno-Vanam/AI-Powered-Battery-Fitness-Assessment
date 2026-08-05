import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import SFSymbol from '../../components/ui/SFSymbol';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import { colors, layout } from '../../theme';
import { fontFamily } from '../../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} contentStyle={styles.safeFill}>
      <View style={styles.screen}>
        <View style={styles.top}>
          <AppText variant="h1" style={styles.title}>
            Choose Your Role
          </AppText>
          <AppText variant="subtitle" color={colors.textSecondary}>
            Select Athlete or Coach to continue
          </AppText>
        </View>

        <View style={styles.middle}>
          {/* Athlete — indigo tint + left accent */}
          <TouchableOpacity
            style={[styles.roleCard, styles.athleteCard]}
            onPress={() => navigation.navigate('AthleteHome')}
            activeOpacity={0.85}
          >
            <View style={styles.athleteAccent} />
            <View style={styles.cardBody}>
              <View style={[styles.iconBox, styles.athleteIcon]}>
                <SFSymbol name="chart.bar.fill" size={layout.iconLg} color={colors.athlete.primary} strokeWidth={2.2} />
              </View>
              <View style={styles.cardContent}>
                <View style={[styles.badge, styles.athleteBadge]}>
                  <AppText variant="pill" color={colors.athlete.primary}>
                    Athlete
                  </AppText>
                </View>
                <AppText variant="h3" color={colors.textPrimary}>
                  I am an Athlete
                </AppText>
                <AppText variant="bodySm" color={colors.textSecondary}>
                  Track fitness assessments and view your progress.
                </AppText>
              </View>
              <View style={[styles.arrowCircle, styles.athleteArrow]}>
                <SFSymbol name="chevron.right" size={20} color={colors.athlete.primary} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Coach — green tint + filled icon */}
          <TouchableOpacity
            style={[styles.roleCard, styles.coachCard]}
            onPress={() => navigation.navigate('CoachLogin')}
            activeOpacity={0.85}
          >
            <View style={styles.coachAccent} />
            <View style={styles.cardBody}>
              <View style={[styles.iconBox, styles.coachIcon]}>
                <SFSymbol name="list.bullet.rectangle" size={layout.iconLg - 2} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <View style={styles.cardContent}>
                <View style={[styles.badge, styles.coachBadge]}>
                  <AppText variant="pill" color={colors.coach.accent}>
                    Coach
                  </AppText>
                </View>
                <AppText variant="h3" color={colors.textPrimary}>
                  I am a Coach
                </AppText>
                <AppText variant="bodySm" color={colors.textSecondary}>
                  Manage athletes and record assessments.
                </AppText>
              </View>
              <View style={[styles.arrowCircle, styles.coachArrow]}>
                <SFSymbol name="chevron.right" size={20} color={colors.coach.accent} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottom}>
          <AppText variant="bodySm" color={colors.textSecondary}>
            New here?
          </AppText>
          <View style={styles.registerLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('AthleteRegister')}>
              <AppText variant="bodySm" color={colors.athlete.primary} style={styles.link}>
                Register as Athlete
              </AppText>
            </TouchableOpacity>
            <AppText variant="bodySm" color={colors.textMuted}>
              {' | '}
            </AppText>
            <TouchableOpacity onPress={() => navigation.navigate('CoachRegister')}>
              <AppText variant="bodySm" color={colors.coach.primary} style={styles.link}>
                Register as Coach
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  safeFill: {
    flex: 1,
  },
  screen: {
    flex: 1,
    justifyContent: 'space-between',
  },
  top: {
    paddingTop: layout.sectionGap,
    gap: layout.fieldGap,
  },
  title: {
    letterSpacing: -0.5,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    gap: layout.formGap,
  },
  roleCard: {
    borderRadius: layout.radiusXl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  athleteCard: {
    backgroundColor: colors.athlete.light,
    borderColor: colors.athlete.primary + '35',
  },
  coachCard: {
    backgroundColor: colors.coach.accentLight,
    borderColor: colors.coach.accent + '40',
  },
  athleteAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: colors.athlete.primary,
  },
  coachAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: colors.coach.accent,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: layout.fieldGap + 10,
    paddingHorizontal: layout.horizontalPadding - 6,
    paddingLeft: layout.horizontalPadding - 2,
  },
  iconBox: {
    width: layout.inputHeight + 6,
    height: layout.inputHeight + 6,
    borderRadius: layout.radiusLg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: layout.fieldGap + 6,
  },
  athleteIcon: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.athlete.primary + '30',
  },
  coachIcon: {
    backgroundColor: colors.coach.accent,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: layout.radiusXl,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 2,
  },
  athleteBadge: {
    backgroundColor: colors.surface,
  },
  coachBadge: {
    backgroundColor: colors.surface,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  athleteArrow: {
    backgroundColor: colors.surface,
  },
  coachArrow: {
    backgroundColor: colors.surface,
  },
  bottom: {
    alignItems: 'center',
    gap: layout.fieldGap,
    paddingBottom: layout.fieldGap,
  },
  registerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  link: {
    fontFamily: fontFamily('700'),
  },
});

export default RoleSelectScreen;
