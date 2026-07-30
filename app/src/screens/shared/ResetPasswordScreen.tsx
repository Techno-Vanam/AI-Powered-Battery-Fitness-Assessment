import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { setUserPassword } from '../../services/authService';

const schema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Za-z]/, 'Password must contain at least 1 letter')
    .matches(/\d/, 'Password must contain at least 1 number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

type FormData = yup.InferType<typeof schema>;

const getStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Za-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
  if (score <= 3) return { score, label: 'Medium', color: '#F59E0B' };
  return { score, label: 'Strong', color: '#22C55E' };
};

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <View style={styles.errorRow}>
      <AlertCircle size={12} color="#EF4444" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  ) : null;

const ResetPasswordScreen = ({ navigation, route }: any) => {
  const { local_id } = route.params ?? {};
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');
  const strength = getStrength(password);

  const onSubmit = async (data: FormData) => {
    if (!local_id) {
      Alert.alert('Error', 'Missing account reference. Please try again.');
      return;
    }
    setLoading(true);
    try {
      await setUserPassword(local_id, data.password);
      setSuccess(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle size={56} color="#22C55E" />
          </View>
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successSubtitle}>
            Your password has been updated successfully. You can now log in with your new password.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('RoleSelect')}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <RefreshCw size={28} color="#4F46E5" />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Choose a new secure password for your account.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.group}>
              <Text style={styles.label}>New Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputRow, errors.password && styles.inputError]}>
                    <Lock size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Min. 8 characters"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPwd}
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
                      {showPwd ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                    </TouchableOpacity>
                  </View>
                )}
              />
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <View key={n} style={[styles.strengthSegment, n <= strength.score && { backgroundColor: strength.color }]} />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}
              <FieldError message={errors.password?.message} />
            </View>

            <View style={styles.group}>
              <Text style={styles.label}>Confirm New Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputRow, errors.confirmPassword && styles.inputError]}>
                    <Lock size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter your new password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showConfirm}
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                      {showConfirm ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                    </TouchableOpacity>
                  </View>
                )}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </View>

            <View style={styles.rules}>
              {[
                { text: 'At least 8 characters', pass: password.length >= 8 },
                { text: 'Contains a letter', pass: /[A-Za-z]/.test(password) },
                { text: 'Contains a number', pass: /\d/.test(password) },
              ].map(r => (
                <View key={r.text} style={styles.ruleRow}>
                  {r.pass ? <CheckCircle size={14} color="#22C55E" /> : <XCircle size={14} color="#CBD5E1" />}
                  <Text style={[styles.ruleText, r.pass && styles.rulePass]}>{r.text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32, gap: 10 },
  iconCircle: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  form: { gap: 20 },
  group: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', letterSpacing: 0.3 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 14, height: 52,
  },
  inputError: { borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  input: { flex: 1, fontSize: 15, color: '#0F172A', paddingVertical: 0 },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  strengthBar: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthSegment: { flex: 1, height: 5, borderRadius: 4, backgroundColor: '#E2E8F0' },
  strengthLabel: { fontSize: 12, fontWeight: '700', width: 48, textAlign: 'right' },
  rules: { gap: 8, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleText: { fontSize: 13, color: '#94A3B8' },
  rulePass: { color: '#22C55E', fontWeight: '600' },
  button: {
    height: 56, borderRadius: 14, backgroundColor: '#4F46E5',
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  successIcon: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0FDF4',
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  successSubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 24 },
});

export default ResetPasswordScreen;
