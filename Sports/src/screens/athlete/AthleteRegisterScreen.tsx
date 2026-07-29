import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { User, Calendar, Phone, CreditCard, Building2, CheckSquare, Square, ChevronDown } from 'lucide-react-native';

const AthleteRegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '', // format YYYY-MM-DD roughly
    gender: '',
    phone: '',
    idType: 'NSRS',
    idNumber: '',
    school: '',
    consent: false,
    guardianName: '',
    guardianRelation: 'Father'
  });

  // Basic auto calc logic for demo:
  const getAge = (dobString: string) => {
    if (dobString.length === 4) {
      const year = parseInt(dobString, 10);
      return new Date().getFullYear() - year;
    }
    return null;
  };

  const age = getAge(formData.dob.substring(0, 4));
  const isMinor = age !== null && age < 18;

  const handleRegister = () => {
    navigation.navigate('AthleteOtpVerify');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join as an athlete and track your journey.</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChangeText={(t) => setFormData({...formData, fullName: t})}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* DOB & Gender Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Birth Year (YYYY)</Text>
                <View style={styles.inputWrapper}>
                  <Calendar size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={formData.dob}
                    onChangeText={(t) => setFormData({...formData, dob: t})}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                {age !== null && (
                  <Text style={styles.helpText}>Age: {age} years</Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderContainer}>
                  {['M', 'F', 'O'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderButton, formData.gender === g && styles.genderButtonActive]}
                      onPress={() => setFormData({...formData, gender: g})}
                    >
                      <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Guardian Block */}
            {isMinor && (
              <View style={styles.guardianBlock}>
                <Text style={styles.guardianTitle}>Guardian Details (Under 18)</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Guardian Name</Text>
                  <View style={styles.inputWrapper}>
                    <User size={20} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Guardian Name"
                      value={formData.guardianName}
                      onChangeText={(t) => setFormData({...formData, guardianName: t})}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#94A3B8" style={styles.inputIcon} />
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={formData.phone}
                  onChangeText={(t) => setFormData({...formData, phone: t})}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* ID Type & Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID Verification</Text>
              <View style={styles.row}>
                <View style={[styles.inputWrapper, { flex: 0.4 }]}>
                  <Text style={styles.idTypeSelector}>{formData.idType}</Text>
                  <ChevronDown size={16} color="#94A3B8" />
                </View>
                <View style={[styles.inputWrapper, { flex: 0.6 }]}>
                  <CreditCard size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ID Number"
                    value={formData.idNumber}
                    onChangeText={(t) => setFormData({...formData, idNumber: t})}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            </View>

            {/* School */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>School / Institution</Text>
              <View style={styles.inputWrapper}>
                <Building2 size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter school name"
                  value={formData.school}
                  onChangeText={(t) => setFormData({...formData, school: t})}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Consent */}
            <TouchableOpacity 
              style={styles.consentRow} 
              activeOpacity={0.8}
              onPress={() => setFormData({...formData, consent: !formData.consent})}
            >
              {formData.consent ? (
                <CheckSquare size={24} color="#4F46E5" />
              ) : (
                <Square size={24} color="#94A3B8" />
              )}
              <Text style={styles.consentText}>
                I agree to the <Text style={styles.consentLink}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AthleteLogin')}>
                <Text style={styles.footerLink}> Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  formContainer: { gap: 20 },
  row: { flexDirection: 'row', gap: 12 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155' },
  helpText: { fontSize: 12, color: '#4F46E5', fontWeight: '500', marginTop: -4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  prefix: { fontSize: 16, color: '#0F172A', marginRight: 8, fontWeight: '500' },
  input: { flex: 1, fontSize: 16, color: '#0F172A' },
  idTypeSelector: { flex: 1, fontSize: 16, color: '#0F172A', fontWeight: '500' },
  genderContainer: { flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 4 },
  genderButton: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  genderButtonActive: { backgroundColor: '#EEF2FF' },
  genderText: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  genderTextActive: { color: '#4F46E5' },
  guardianBlock: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, gap: 12 },
  guardianTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  consentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  consentText: { marginLeft: 12, fontSize: 14, color: '#64748B', flex: 1 },
  consentLink: { color: '#4F46E5', fontWeight: '600' },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, paddingBottom: 24 },
  footerText: { fontSize: 15, color: '#64748B' },
  footerLink: { fontSize: 15, color: '#4F46E5', fontWeight: '600' }
});

export default AthleteRegisterScreen;
