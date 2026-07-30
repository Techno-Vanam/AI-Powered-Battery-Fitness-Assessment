import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Activity, ClipboardList, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface SelectModeScreenProps {
  navigation: any;
}

const SelectModeScreen: React.FC<SelectModeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Select your portal to continue</Text>
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
              <Text style={styles.cardTitle}>Athlete Portal</Text>
              <Text style={styles.cardDescription}>
                Track fitness assessments and view progress.
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
              <Text style={styles.cardTitle}>Coach Portal</Text>
              <Text style={styles.cardDescription}>
                Manage athletes and record assessments.
              </Text>
            </View>
            <ChevronRight size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Need to register?</Text>
          <View style={styles.registerLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('AthleteRegister')}>
              <Text style={styles.linkText}>New Athlete</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> | </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CoachRegister')}>
              <Text style={styles.linkText}>New Coach</Text>
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
    backgroundColor: '#F8FAFC', // slate 50
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
    color: '#0F172A', // slate 900
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B', // slate 500
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
    backgroundColor: '#EEF2FF', // indigo 50
  },
  coachIconBg: {
    backgroundColor: '#ECFDF5', // emerald 50
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B', // slate 800
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B', // slate 500
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
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5', // indigo 600
  },
});

export default SelectModeScreen;
