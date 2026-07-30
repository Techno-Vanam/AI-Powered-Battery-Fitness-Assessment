import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView
} from 'react-native';
import { FileText, ArrowLeft } from 'lucide-react-native';

const TC_CONTENT = `
Last Updated: July 2025

1. ACCEPTANCE OF TERMS
By registering and using the Sports Assessment Platform ("the App"), you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before proceeding.

2. ELIGIBILITY
This application is intended for athletes, coaches, and sports educators associated with recognized institutions. By registering, you confirm that you are eligible to participate in the specified categories.

3. DATA COLLECTION AND STORAGE
The App collects personal information including but not limited to your name, date of birth, gender, contact details, and government-issued identification numbers (NSRS/APAAR/Aadhar). This data is:
• Stored securely on your device in an encrypted local database.
• Synchronized with our secure remote servers when internet connectivity is available.
• Never shared with unauthorized third parties without your explicit consent.

4. IDENTIFICATION VERIFICATION
You are required to provide a valid government-issued ID (NSRS, APAAR, or Aadhar). Providing false or inaccurate identification is a violation of these terms and may result in account suspension.

5. MINOR ATHLETES
Athletes under the age of 18 must have a parent or legal guardian complete the registration process and provide their consent. The guardian is responsible for the accuracy of all information provided.

6. PASSWORD AND SECURITY
You are responsible for maintaining the confidentiality of your account credentials. The App stores passwords using industry-standard hashing. You must immediately notify us if you suspect unauthorized access to your account.

7. OFFLINE USE
This application is designed to function in offline environments. Data entered while offline will be synchronized with our servers upon reconnection. You acknowledge that there may be a brief delay in synchronization.

8. ACCEPTABLE USE
You agree not to:
• Use the App for any fraudulent purpose.
• Attempt to gain unauthorized access to any part of the system.
• Submit false performance data or assessments.
• Use another person's identification credentials.

9. INTELLECTUAL PROPERTY
All content, logos, and software components of the App are the property of the Sports Assessment Authority and are protected under applicable intellectual property laws.

10. LIMITATION OF LIABILITY
The Sports Assessment Authority shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the App.

11. CHANGES TO TERMS
We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the new Terms.

12. CONTACT
For questions or concerns regarding these Terms, please contact: support@sportsassessment.in
`;

const TermsAndConditionsScreen = ({ navigation, route }: any) => {
  const { onAccept } = route.params ?? {};

  const handleAccept = () => {
    if (onAccept) onAccept();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconRow}>
          <FileText size={32} color="#4F46E5" />
        </View>
        <Text style={styles.title}>Sports Assessment Platform</Text>
        <Text style={styles.subtitle}>Terms of Use &amp; Privacy Policy</Text>

        <View style={styles.divider} />

        <Text style={styles.body}>{TC_CONTENT.trim()}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
          <Text style={styles.acceptText}>Accept &amp; Return to Registration</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.declineText}>Back Without Accepting</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  content: { padding: 24, paddingBottom: 12 },
  iconRow: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 20 },
  body: { fontSize: 14, color: '#334155', lineHeight: 24 },
  footer: {
    padding: 20, paddingBottom: 32, gap: 10, borderTopWidth: 1,
    borderColor: '#E2E8F0', backgroundColor: '#FFFFFF',
  },
  acceptBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#4F46E5',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  acceptText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  declineBtn: { height: 44, justifyContent: 'center', alignItems: 'center' },
  declineText: { fontSize: 14, color: '#94A3B8' },
});

export default TermsAndConditionsScreen;
