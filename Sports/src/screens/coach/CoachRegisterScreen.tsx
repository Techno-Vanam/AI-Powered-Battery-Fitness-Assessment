import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { User, Phone, CreditCard, Building2, CheckSquare, Square, ChevronDown, Briefcase } from 'lucide-react-native';

const CoachRegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    fullName: '',
    organization: '',
    designation: 'Coach',
    gender: '',
    phone: '',
    idType: 'NSRS',
    idNumber: '',
    consent: false,
  });

  const designations = ['Coach', 'PE Teacher', 'TIDC', 'TIZC'];

  const handleRegister = () => {
    navigation.navigate('CoachOtpVerify');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Coach Registration</Text>
            <Text style={styles.subtitle}>Join as a coach and manage your athletes.</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Jane Smith"
                  value={formData.fullName}
                  onChangeText={(t) => setFormData({...formData, fullName: t})}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Organization */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Organization Name</Text>
              <View style={styles.inputWrapper}>
                <Building2 size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Sports Academy"
                  value={formData.organization}
                  onChangeText={(t) => setFormData({...formData, organization: t})}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Designation & Gender Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 0.6 }]}>
                <Text style={styles.label}>Designation</Text>
                <View style={styles.inputWrapper}>
                  <Briefcase size={20} color="#94A3B8" style={styles.inputIcon} />
                  <Text style={styles.designationSelector}>{formData.designation}</Text>
                  <ChevronDown size={16} color="#94A3B8" />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 0.4 }]}>
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
            
            {/* Simple Designation Picker (Just for demo purposes underneath) */}
            <View style={styles.designationPills}>
              {designations.map(d => (
                <TouchableOpacity 
                  key={d} 
                  style={[styles.pill, formData.designation === d && styles.pillActive]}
                  onPress={() => setFormData({...formData, designation: d})}
                >
                  <Text style={[styles.pillText, formData.designation === d && styles.pillTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

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

            {/* Consent */}
            <TouchableOpacity 
              style={styles.consentRow} 
              activeOpacity={0.8}
              onPress={() => setFormData({...formData, consent: !formData.consent})}
            >
              {formData.consent ? (
                <CheckSquare size={24} color="#059669" />
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
              <TouchableOpacity onPress={() => navigation.navigate('CoachLogin')}>
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
  designationSelector: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '500' },
  genderContainer: { flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 4 },
  genderButton: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  genderButtonActive: { backgroundColor: '#ECFDF5' },
  genderText: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  genderTextActive: { color: '#059669' },
  designationPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -12 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F1F5F9', borderRadius: 16, borderWidth: 1, borderColor: 'transparent' },
  pillActive: { backgroundColor: '#ECFDF5', borderColor: '#34D399' },
  pillText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  pillTextActive: { color: '#059669', fontWeight: '700' },
  consentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  consentText: { marginLeft: 12, fontSize: 14, color: '#64748B', flex: 1 },
  consentLink: { color: '#059669', fontWeight: '600' },
  button: { backgroundColor: '#059669', borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, paddingBottom: 24 },
  footerText: { fontSize: 15, color: '#64748B' },
  footerLink: { fontSize: 15, color: '#059669', fontWeight: '600' }
});

export default CoachRegisterScreen;
