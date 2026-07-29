import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Fingerprint, CreditCard, UserCircle } from 'lucide-react-native';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [idType, setIdType] = useState('NSRS');
  const [idNumber, setIdNumber] = useState('');

  const handleCheckAndReset = () => {
    // In a real app, query local/remote DB. If found, proceed to ResetPassword.
    // Since we're mocking, we'll just navigate to ResetPassword.
    if (idNumber.length > 3) {
      navigation.navigate('ResetPassword');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Enter your registered ID to reset your password. No OTP required.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select ID Type</Text>
              <View style={styles.idTypeContainer}>
                {['NSRS', 'APAAR', 'Aadhar'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.idTypeButton, idType === type && styles.idTypeButtonActive]}
                    onPress={() => setIdType(type)}
                  >
                    <Text style={[styles.idTypeText, idType === type && styles.idTypeTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{idType} Number</Text>
              <View style={styles.inputWrapper}>
                {idType === 'NSRS' && <UserCircle size={20} color="#94A3B8" style={styles.inputIcon} />}
                {idType === 'APAAR' && <CreditCard size={20} color="#94A3B8" style={styles.inputIcon} />}
                {idType === 'Aadhar' && <Fingerprint size={20} color="#94A3B8" style={styles.inputIcon} />}
                
                <TextInput
                  style={styles.input}
                  placeholder={`Enter your ${idType} number`}
                  value={idNumber}
                  onChangeText={setIdNumber}
                  placeholderTextColor="#94A3B8"
                  keyboardType={idType === 'Aadhar' ? 'number-pad' : 'default'}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, idNumber.length < 4 && styles.buttonDisabled]} 
              onPress={handleCheckAndReset}
              disabled={idNumber.length < 4}
            >
              <Text style={styles.buttonText}>Check & Reset</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  formContainer: { gap: 24 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155' },
  idTypeContainer: { flexDirection: 'row', gap: 8 },
  idTypeButton: { flex: 1, paddingVertical: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, alignItems: 'center' },
  idTypeButtonActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  idTypeText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  idTypeTextActive: { color: '#4F46E5' },
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
  input: { flex: 1, fontSize: 16, color: '#0F172A' },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { backgroundColor: '#A5B4FC' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default ForgotPasswordScreen;
