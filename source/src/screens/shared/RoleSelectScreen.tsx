import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Activity, ClipboardList, ChevronRight } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>Select Athlete or Coach to continue</Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AthleteLogin')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, styles.athleteIconBg]}>
              <Activity size={32} color="#4F46E5" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Athlete</Text>
              <Text style={styles.cardDescription}>
                Track fitness assessments and view your progress.
              </Text>
            </View>
            <ChevronRight size={24} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CoachLogin')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, styles.coachIconBg]}>
              <ClipboardList size={32} color="#059669" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Coach</Text>
              <Text style={styles.cardDescription}>
                Manage athletes and record assessments.
              </Text>
            </View>
            <ChevronRight size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>New here?</Text>
          <View style={styles.registerLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('AthleteRegister')}>
              <Text style={styles.linkText}>Register as Athlete</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> | </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CoachRegister')}>
              <Text style={styles.linkText}>Register as Coach</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  athleteIconBg: {
    backgroundColor: '#EEF2FF',
  },
  coachIconBg: {
    backgroundColor: '#ECFDF5',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  footerContainer: {
    marginTop: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  registerLinks: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
  },
});

export default RoleSelectScreen;
