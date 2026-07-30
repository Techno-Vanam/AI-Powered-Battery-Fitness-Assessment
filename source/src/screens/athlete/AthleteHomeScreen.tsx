import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView,
} from 'react-native';
import { User, Activity, LogOut } from 'lucide-react-native';

const AthleteHomeScreen = ({ navigation, route }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <User size={36} color="#4F46E5" />
          </View>
          <Text style={styles.welcome}>Welcome, Athlete!</Text>
          <Text style={styles.subtitle}>Your fitness dashboard is coming soon.</Text>
        </View>

        <View style={styles.card}>
          <Activity size={24} color="#4F46E5" />
          <Text style={styles.cardTitle}>Battery Fitness Assessment</Text>
          <Text style={styles.cardBody}>
            Your assessment results and progress tracking will appear here.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] })}
        >
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flexGrow: 1, padding: 24, alignItems: 'center', gap: 24, paddingTop: 48 },
  header: { alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  welcome: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center' },
  card: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E2E8F0', padding: 20, gap: 10,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  cardBody: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5', marginTop: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});

export default AthleteHomeScreen;
