import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Athlete, SportType } from '../../types/app';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface EditAthleteScreenProps {
  athlete: Athlete;
  onBack: () => void;
  onSuccess: () => void;
}

export const EditAthleteScreen: React.FC<EditAthleteScreenProps> = ({
  athlete,
  onBack,
  onSuccess,
}) => {
  const { updateAthlete } = useApp();

  const [name, setName] = useState(athlete.name);
  const [age, setAge] = useState(athlete.age.toString());
  const [school, setSchool] = useState(athlete.school);
  const [sport, setSport] = useState<SportType>(athlete.sport);
  const [phone, setPhone] = useState(athlete.phone || '');

  const sportsList: SportType[] = ['Athletics', 'Swimming', 'Football', 'Badminton', 'Basketball', 'Volleyball'];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter athlete name.');
      return;
    }

    updateAthlete({
      ...athlete,
      name: name.trim(),
      age: parseInt(age, 10) || athlete.age,
      school: school.trim() || athlete.school,
      sport,
      phone: phone.trim(),
    });

    onSuccess();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Athlete</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Save size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.fieldLabel}>Age</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <Text style={styles.fieldLabel}>School / Academic Institution</Text>
          <TextInput
            style={styles.input}
            value={school}
            onChangeText={setSchool}
          />

          <Text style={styles.fieldLabel}>Primary Sport</Text>
          <View style={styles.sportWrap}>
            {sportsList.map(sp => (
              <TouchableOpacity
                key={sp}
                style={[styles.sportChip, sport === sp && styles.sportChipActive]}
                onPress={() => setSport(sp)}
              >
                <Text style={[styles.sportText, sport === sp && styles.sportTextActive]}>{sp}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TouchableOpacity activeOpacity={0.8} style={styles.submitBtn} onPress={handleSave}>
            <Text style={styles.submitBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  saveBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.buttonRadius, // 12px
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  sportWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  sportChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 6,
    marginBottom: 8,
  },
  sportChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sportTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: layout.buttonRadius, // 12px
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
