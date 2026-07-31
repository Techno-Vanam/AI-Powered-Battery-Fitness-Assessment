import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  StyleSheet,
} from 'react-native';
import { ShieldCheck, RefreshCw } from 'lucide-react-native';
import { verifyOTP, generateMockOTP, getLatestOTP } from '../../db/otpService';
import { markUserVerified } from '../../db/userRepository';
import { runSyncJob } from '../../services/syncService';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import { createAuthStyles, createOtpStyles } from '../../styles/screenStyles';
import { colors, layout } from '../../theme';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300;

const authStyles = createAuthStyles('athlete');
const styles = createOtpStyles('athlete');

const AthleteOtpVerifyScreen = ({ navigation, route }: any) => {
  const { local_id } = route.params ?? {};
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const storedOtp = getLatestOTP(local_id);
    const initialValue = storedOtp ?? generateMockOTP(local_id);
    setGeneratedOtp(initialValue || '');
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setTimeLeft(OTP_EXPIRY_SECONDS);
    setIsExpired(false);
  }, [local_id]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    try {
      const newOtp = generateMockOTP(local_id);
      setGeneratedOtp(String(newOtp).trim());
      setTimeLeft(OTP_EXPIRY_SECONDS);
      setIsExpired(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
      inputRefs.current[0]?.focus();
    } catch {
      Alert.alert('Error', 'Could not regenerate OTP.');
    }
  };

  const handleVerify = async () => {
    const entered = String(otp.join('')).trim();
    const expected = String(getLatestOTP(local_id) ?? generatedOtp).trim();

    if (isExpired) {
      setError('OTP expired, please resend.');
      triggerShake();
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      return;
    }

    if (entered.length < OTP_LENGTH) return;
    if (entered !== expected) {
      setError('Incorrect OTP, please check the code shown above.');
      triggerShake();
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const isValid = await verifyOTP(local_id, entered);
      if (isValid) {
        await markUserVerified(local_id);
        void runSyncJob();
        navigation.navigate('SetPassword', { local_id, role: 'athlete' });
      } else {
        setError('Incorrect OTP, please check the code shown above.');
        triggerShake();
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const enteredFull = otp.every(d => d !== '');

  return (
    <Screen scroll keyboard centered>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={layout.iconLg} color={colors.athlete.primary} />
          </View>
          <AppText variant="h2" style={styles.centered}>
            Verify Your ID
          </AppText>
          <AppText variant="bodySm" color={colors.textSecondary} style={styles.centered}>
            A one-time code has been generated for your NSRS/APAAR/Aadhar verification.
          </AppText>
        </View>

        <View style={styles.otpBanner}>
          <AppText variant="caption" color={colors.success}>
            Demo OTP (Read & Re-enter Below)
          </AppText>
          <View style={styles.otpDisplay}>
            {String(generatedOtp).split('').map((digit, i) => (
              <View key={i} style={styles.otpDisplayBox}>
                <AppText style={styles.otpDisplayDigit}>{digit}</AppText>
              </View>
            ))}
          </View>
          <AppText variant="caption" color={colors.textSecondary} style={styles.centered}>
            This OTP is displayed on-screen for offline/demo use only.
          </AppText>
        </View>

        <Animated.View style={[styles.inputRow, { transform: [{ translateX: shakeAnim }] }]}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={ref => { inputRefs.current[i] = ref; }}
              style={[
                authStyles.otpBox,
                digit ? styles.otpBoxFilled : null,
                error ? authStyles.otpBoxError : null,
              ]}
              value={digit}
              onChangeText={text => handleChange(text.slice(-1), i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={i === 0}
              selectTextOnFocus
            />
          ))}
        </Animated.View>

        {!!error && (
          <AppText variant="caption" color={colors.error} style={styles.centered}>
            {error}
          </AppText>
        )}

        <View style={styles.timerRow}>
          {!isExpired ? (
            <AppText variant="caption" color={colors.textMuted}>
              Code expires in{' '}
              <AppText variant="caption" color={colors.textSecondary}>
                {formatTime(timeLeft)}
              </AppText>
            </AppText>
          ) : (
            <TouchableOpacity style={styles.resendBtn} onPress={handleResend}>
              <RefreshCw size={layout.iconSm - 4} color={colors.athlete.primary} />
              <AppText variant="bodySm" color={colors.athlete.primary}>
                Resend OTP
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        <Button
          title="Verify & Continue"
          role="athlete"
          loading={loading}
          disabled={!enteredFull || isExpired}
          onPress={handleVerify}
          style={localStyles.fullWidth}
        />
      </View>
    </Screen>
  );
};

const localStyles = StyleSheet.create({
  fullWidth: { width: '100%' },
});

export default AthleteOtpVerifyScreen;
