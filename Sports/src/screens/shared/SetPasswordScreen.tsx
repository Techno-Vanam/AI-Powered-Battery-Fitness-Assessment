import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';

interface SetPasswordScreenProps {
  navigation: any;
  route: any;
}

const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: 'Weak', color: '#E2E8F0', flex: 0 };
    if (password.length < 8) return { label: 'Weak', color: '#EF4444', flex: 1 };
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (hasLetter && hasNumber && password.length >= 8) return { label: 'Strong', color: '#10B981', flex: 3 };
    return { label: 'Medium', color: '#F59E0B', flex: 2 };
  };

  const strength = getPasswordStrength();
  const isValid = strength.label === 'Strong' && password === confirmPassword && password.length > 0;

  const handleSubmit = () => {
    if (isValid) {
      // Simulate saving password locally
      setIsSuccess(true);
    }
  };

  const handleContinue = () => {
    navigation.navigate('SelectMode'); 
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <CheckCircle2 size={64} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Password Set!</Text>
          <Text style={styles.successSubtitle}>Your account has been secured successfully.</Text>
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Secure Your Account</Text>
            <Text style={styles.subtitle}>Create a strong password with at least 8 characters, including a letter and a number.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                <View style={[styles.strengthBar, { flex: strength.flex >= 1 ? 1 : 0, backgroundColor: strength.flex >= 1 ? strength.color : '#E2E8F0' }]} />
                <View style={[styles.strengthBar, { flex: strength.flex >= 2 ? 1 : 0, backgroundColor: strength.flex >= 2 ? strength.color : 'transparent' }]} />
                <View style={[styles.strengthBar, { flex: strength.flex >= 3 ? 1 : 0, backgroundColor: strength.flex >= 3 ? strength.color : 'transparent' }]} />
              </View>
              <Text style={[styles.strengthText, { color: strength.color === '#E2E8F0' ? '#94A3B8' : strength.color }]}>
                {strength.flex > 0 ? strength.label : ''}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  {showConfirmPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.button, !isValid && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={!isValid}
            >
              <Text style={styles.buttonText}>Set Password & Continue</Text>
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
  eyeIcon: { padding: 8 },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -16, marginBottom: 8 },
  strengthBars: { flexDirection: 'row', gap: 4, width: 100, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  strengthBar: { height: '100%', borderRadius: 2 },
  strengthText: { fontSize: 12, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 14, marginTop: 4 },
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
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successIconContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  successSubtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 48 },
});

export default SetPasswordScreen;
