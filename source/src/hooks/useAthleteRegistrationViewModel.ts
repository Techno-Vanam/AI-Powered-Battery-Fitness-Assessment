import { useState, useEffect, useCallback } from 'react';
import { AthleteRegistrationForm } from '../domain/models/Athlete';
import { AthleteUseCases } from '../domain/usecases/AthleteUseCases';
import { Athlete } from '../database/repositories/AthleteRepository';

const INITIAL_FORM: AthleteRegistrationForm = {
  id: '',
  name: '',
  gender: '',
  dateOfBirth: '',
  phone: '',
  heightCategory: '',
  coachName: '',
  schoolAcademy: '',
  state: '',
  district: '',
};

export function useAthleteRegistrationViewModel(initialAthlete?: Athlete | null) {
  const isEditMode = Boolean(initialAthlete?.id);
  const [form, setForm] = useState<AthleteRegistrationForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AthleteRegistrationForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [age, setAge] = useState<number | null>(null);

  // Initialize form or auto-generate unique Athlete ID prefix
  useEffect(() => {
    if (initialAthlete) {
      setForm({
        id: initialAthlete.id,
        name: initialAthlete.name,
        gender: initialAthlete.gender,
        dateOfBirth: initialAthlete.dateOfBirth ?? '',
        phone: initialAthlete.phone ?? '',
        heightCategory: initialAthlete.heightCategory ?? '',
        coachName: initialAthlete.coachName ?? '',
        schoolAcademy: initialAthlete.schoolAcademy ?? '',
        state: initialAthlete.state ?? '',
        district: initialAthlete.district ?? '',
      });
      if (initialAthlete.dateOfBirth) {
        setAge(AthleteUseCases.calculateAge(initialAthlete.dateOfBirth));
      }
    } else {
      // Auto-generate suggested ID like ATH-8472
      const randomId = `ATH-${Math.floor(1000 + Math.random() * 9000)}`;
      setForm(prev => ({ ...prev, id: randomId }));
    }
  }, [initialAthlete]);

  // Handle field change and auto calculate age if Date of Birth changes
  const updateField = useCallback(
    (field: keyof AthleteRegistrationForm, value: string) => {
      setForm(prev => {
        const next = { ...prev, [field]: value };
        if (field === 'dateOfBirth') {
          const calcAge = AthleteUseCases.calculateAge(value);
          setAge(calcAge);
        }
        return next;
      });

      // Clear error for edited field
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  // Validate form and check duplicate ID in real time
  const submitForm = useCallback(async (): Promise<Athlete | null> => {
    setIsSubmitting(true);
    try {
      const validation = await AthleteUseCases.validateForm(form, isEditMode);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsSubmitting(false);
        return null;
      }

      let savedAthlete: Athlete;
      if (isEditMode) {
        savedAthlete = await AthleteUseCases.updateAthlete(form);
      } else {
        savedAthlete = await AthleteUseCases.registerAthlete(form);
      }
      setIsSubmitting(false);
      return savedAthlete;
    } catch (err: any) {
      setErrors(prev => ({ ...prev, id: err.message ?? 'Failed to save athlete' }));
      setIsSubmitting(false);
      return null;
    }
  }, [form, isEditMode]);

  return {
    form,
    errors,
    isEditMode,
    isSubmitting,
    age,
    updateField,
    submitForm,
  };
}
