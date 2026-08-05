import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { QuickActionCard } from '../../components/ui/QuickActionCard';
import PortalHeader from '../../components/portal/PortalHeader';
import AppText from '../../components/ui/AppText';
import { colors, layout } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={portalStyles.screen}>
      <PortalHeader greeting="Welcome" title="Battery Fitness Assessment" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <AppText variant="h1" style={styles.title}>
            Choose Your Role
          </AppText>
          <AppText variant="subtitle" color={colors.textSecondary}>
            Select Athlete or Coach to continue
          </AppText>
        </View>

        <View style={styles.cards}>
          <QuickActionCard
            title="I am an Athlete"
            subtitle="Track fitness assessments and view your progress."
            type="view"
            onPress={() => navigation.navigate('AthleteHome')}
          />
          <QuickActionCard
            title="I am a Coach"
            subtitle="Manage athletes and record assessments."
            type="add"
            onPress={() => navigation.navigate('CoachHome')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: layout.sectionGap,
    paddingBottom: layout.sectionGap * 2,
    gap: layout.formGap,
  },
  intro: {
    gap: layout.fieldGap,
    marginBottom: 8,
  },
  title: {
    letterSpacing: -0.5,
  },
  cards: {
    gap: 4,
  },
});

export default RoleSelectScreen;
