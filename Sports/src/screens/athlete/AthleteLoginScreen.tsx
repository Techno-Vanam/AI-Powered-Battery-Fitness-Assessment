import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { CreditCard, Lock, Eye, EyeOff, ChevronDown, WifiOff, Activity } from 'lucide-react-native';

const AthleteLoginScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    idType: 'NSRS',
    idNumber: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Mock offline state
  const isOffline = false;

  const handleLogin = () => {
    // Navigate somewhere after login
    // navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Activity size={40} color="#4F46E5" />
            </View>
            <Text style={styles.title}>Athlete Portal</Text>
            <Text style={styles.subtitle}>Welcome back! Please login to your account.</Text>
            
            {isOffline && (
              <View style={styles.offlineBadge}>
                <WifiOff size={14} color="#B45309" />
                <Text style={styles.offlineText}>Offline Mode - Local Login Available</Text>
              </View>
            )}
          </View>

          <View style={styles.formContainer}>
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(t) => setFormData({...formData, password: t})}
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.forgotPasswordRow}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>New user? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AthleteRegister')}>
                <Text style={styles.footerLink}>Register here</Text>
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
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  iconContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center' },
  offlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 16, gap: 6 },
  offlineText: { fontSize: 12, fontWeight: '600', color: '#B45309' },
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
  input: { flex: 1, fontSize: 16, color: '#0F172A' },
  idTypeSelector: { flex: 1, fontSize: 16, color: '#0F172A', fontWeight: '500' },
  eyeIcon: { padding: 8 },
  forgotPasswordRow: { alignItems: 'flex-end', marginTop: -8 },
  forgotPasswordText: { color: '#4F46E5', fontWeight: '600', fontSize: 14 },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 15, color: '#64748B' },
  footerLink: { fontSize: 15, color: '#4F46E5', fontWeight: '600' }
});

export default AthleteLoginScreen;
