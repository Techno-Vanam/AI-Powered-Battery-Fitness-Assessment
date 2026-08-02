import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Lock, XCircle, CheckCircle } from 'lucide-react-native';

import { setUserPassword } from '../../services/authService';
import { createRegisterStyles } from '../../styles/screenStyles';
import FieldError from '../../components/ui/FieldError';
import Screen from '../../components/ui/Screen';
import { Role } from '../../theme';

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

const getStrength = (pwd: string): { score: number; label: string; color: string } => {
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

const SetPasswordScreen = ({ navigation, route }: any) => {
  const { local_id, role } = route.params ?? {};
  const styles = createRegisterStyles((role as Role) === 'coach' ? 'coach' : 'athlete');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');
  const strength = getStrength(password);

  const onSubmit = async (data: FormData) => {
    if (!local_id) {
      Alert.alert('Error', 'Missing account reference. Please restart registration.');
      return;
    }
    setLoading(true);
    try {
      await setUserPassword(local_id, data.password);
      const homeRoute = role === 'coach' ? 'CoachHome' : 'AthleteHome';
      navigation.reset({ index: 0, routes: [{ name: homeRoute }] });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <View style={styles.headerCentered}>
        <View style={styles.iconCircle}>
          <Lock size={28} color="#4F46E5" />
        </View>
        <Text style={styles.title}>Set Your Password</Text>
        <Text style={styles.subtitle}>Create a secure password to protect your account.</Text>
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
                  <View
                    key={n}
                    style={[styles.strengthSegment, n <= strength.score && { backgroundColor: strength.color }]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}
          <FieldError message={errors.password?.message} />
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>Confirm Password</Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputRow, errors.confirmPassword && styles.inputError]}>
                <Lock size={18} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
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
            : <Text style={styles.buttonText}>Set Password & Continue</Text>}
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

export default SetPasswordScreen;
