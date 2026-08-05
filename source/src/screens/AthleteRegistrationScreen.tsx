import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/camera';
import { useAthleteRegistrationViewModel } from '../hooks/useAthleteRegistrationViewModel';
import {
  ScreenHeader,
  InputField,
  SelectPicker,
} from '../components/FormComponents';
import {
  GENDER_OPTIONS,
  HEIGHT_CATEGORIES,
  INDIAN_STATES,
} from '../domain/models/Athlete';

type Props = NativeStackScreenProps<RootStackParamList, 'AthleteRegistration'>;

export function AthleteRegistrationScreen({ navigation, route }: Props) {
  const initialAthlete = route.params?.athlete ?? null;

  const {
    form,
    errors,
    isEditMode,
    isSubmitting,
    age,
    updateField,
    submitForm,
  } = useAthleteRegistrationViewModel(initialAthlete);

  const handleSave = async () => {
    const saved = await submitForm();
    if (saved) {
      Alert.alert(
        isEditMode ? 'Athlete Updated' : 'Athlete Registered',
        `${saved.name} (${saved.id}) saved locally in database.`,
        [
          {
            text: 'Start Height Test',
            onPress: () =>
              navigation.navigate('HeightTestInstructions', { athlete: saved }),
          },
          {
            text: 'Return Home',
            onPress: () => navigation.navigate('Home'),
          },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader
            title={isEditMode ? 'Edit Athlete' : 'New Registration'}
            subtitle="Fill all required athlete parameters for fitness testing"
            onBack={() => navigation.goBack()}
          />

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* 1. Athlete ID */}
            <InputField
              label="Athlete ID"
              placeholder="e.g. ATH-1001"
              value={form.id}
              onChangeText={val => updateField('id', val)}
              error={errors.id}
              icon="🆔"
              isRequired
              editable={!isEditMode}
            />

            {/* 2. Full Name */}
            <InputField
              label="Full Name"
              placeholder="Enter athlete's full name"
              value={form.name}
              onChangeText={val => updateField('name', val)}
              error={errors.name}
              icon="👤"
              isRequired
            />

            {/* Row: Gender & DOB */}
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <SelectPicker
                  label="Gender"
                  value={form.gender}
                  options={GENDER_OPTIONS}
                  onSelect={val => updateField('gender', val)}
                  error={errors.gender}
                  icon="⚧"
                  isRequired
                />
              </View>

              <View style={styles.halfCol}>
                <InputField
                  label="Date of Birth"
                  placeholder="YYYY-MM-DD"
                  value={form.dateOfBirth}
                  onChangeText={val => updateField('dateOfBirth', val)}
                  error={errors.dateOfBirth}
                  icon="📅"
                  isRequired
                  maxLength={10}
                />
              </View>
            </View>

            {/* Auto Calculated Age Banner */}
            {age !== null && (
              <View style={styles.ageBanner}>
                <Text style={styles.ageLabel}>Auto Calculated Age:</Text>
                <Text style={styles.ageValue}>{age} Years Old</Text>
              </View>
            )}

            {/* 5. Height Category */}
            <SelectPicker
              label="Height Category"
              value={form.heightCategory}
              options={HEIGHT_CATEGORIES}
              onSelect={val => updateField('heightCategory', val)}
              error={errors.heightCategory}
              icon="🏆"
              isRequired
              placeholder="Select category (Sub-Junior, Junior, etc.)"
            />

            {/* 6. Coach Name */}
            <InputField
              label="Coach Name"
              placeholder="Enter coach / trainer name"
              value={form.coachName}
              onChangeText={val => updateField('coachName', val)}
              error={errors.coachName}
              icon="🧢"
              isRequired
            />

            {/* 7. School / Academy */}
            <InputField
              label="School / Academy"
              placeholder="Enter school, college, or sports club"
              value={form.schoolAcademy}
              onChangeText={val => updateField('schoolAcademy', val)}
              error={errors.schoolAcademy}
              icon="🏫"
              isRequired
            />

            {/* Row: State & District */}
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <SelectPicker
                  label="State"
                  value={form.state}
                  options={INDIAN_STATES}
                  onSelect={val => updateField('state', val)}
                  error={errors.state}
                  icon="📍"
                  isRequired
                />
              </View>

              <View style={styles.halfCol}>
                <InputField
                  label="District"
                  placeholder="District"
                  value={form.district}
                  onChangeText={val => updateField('district', val)}
                  error={errors.district}
                  icon="🏙️"
                  isRequired
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isEditMode ? 'Update Athlete' : 'Register & Save Locally'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  ageBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  ageLabel: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '600',
  },
  ageValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
