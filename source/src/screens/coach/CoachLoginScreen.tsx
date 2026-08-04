import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { ShieldCheck, UserCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface CoachLoginScreenProps {
  onLoginSuccess: () => void;
  onForgotPassword: () => void;
}

export const CoachLoginScreen: React.FC<CoachLoginScreenProps> = ({
  onLoginSuccess,
  onForgotPassword,
}) => {
  const [idNumber, setIdNumber] = useState('NSRS-2026-COACH-101');
  const [password, setPassword] = useState('password123');

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <View style={styles.iconCircle}>
            <UserCheck size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>Coach Portal Login</Text>
          <Text style={styles.subtitle}>Enter your NSRS / APPAR / Aadhaar credentials</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>NSRS / APPAR / Aadhaar ID</Text>
          <TextInput
            style={styles.input}
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="e.g. NSRS-2026-1001"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
          />
        </View>

        <TouchableOpacity activeOpacity={0.7} style={styles.forgotBtn} onPress={onForgotPassword}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.loginBtn} onPress={onLoginSuccess}>
          <Text style={styles.loginBtnText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.securityFooter}>
          <ShieldCheck size={16} color={colors.success} style={{ marginRight: 6 }} />
          <Text style={styles.securityText}>Official MYAS / SAI Assessment Protocol</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.buttonRadius, // 12px
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  loginBtn: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: layout.buttonRadius, // 12px
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
