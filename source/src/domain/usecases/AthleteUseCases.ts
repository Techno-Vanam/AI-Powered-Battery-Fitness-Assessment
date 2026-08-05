import { AthleteRepository, Athlete } from '../../database/repositories/AthleteRepository';
import { AthleteRegistrationForm, ValidationResult } from '../models/Athlete';

/**
 * Calculates exact age in years from Date of Birth (YYYY-MM-DD format).
 */
export function calculateAgeFromDOB(dobString: string): number | null {
  if (!dobString || dobString.trim().length === 0) return null;
  
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export const AthleteUseCases = {
  calculateAge: calculateAgeFromDOB,

  async validateForm(
    form: AthleteRegistrationForm,
    isEditMode: boolean = false,
  ): Promise<ValidationResult> {
    const errors: Partial<Record<keyof AthleteRegistrationForm, string>> = {};

    // 1. Athlete ID check
    if (!form.id || form.id.trim().length === 0) {
      errors.id = 'Athlete ID is required';
    } else if (!isEditMode) {
      const exists = await AthleteRepository.existsById(form.id.trim());
      if (exists) {
        errors.id = 'Athlete ID already exists. Please use a unique ID.';
      }
    }

    // 2. Full Name
    if (!form.name || form.name.trim().length < 2) {
      errors.name = 'Full Name is required (minimum 2 characters)';
    }

    // 3. Gender
    if (!form.gender || form.gender.trim().length === 0) {
      errors.gender = 'Please select a gender';
    }

    // 4. Date of Birth & Age
    if (!form.dateOfBirth || form.dateOfBirth.trim().length === 0) {
      errors.dateOfBirth = 'Date of Birth is required';
    } else {
      const age = calculateAgeFromDOB(form.dateOfBirth);
      if (age === null) {
        errors.dateOfBirth = 'Please enter a valid Date of Birth (YYYY-MM-DD)';
      } else if (age < 3 || age > 100) {
        errors.dateOfBirth = 'Age must be between 3 and 100 years';
      }
    }

    // 5. Height Category
    if (!form.heightCategory || form.heightCategory.trim().length === 0) {
      errors.heightCategory = 'Please select a height category';
    }

    // 6. Coach Name
    if (!form.coachName || form.coachName.trim().length === 0) {
      errors.coachName = 'Coach Name is required';
    }

    // 7. School / Academy
    if (!form.schoolAcademy || form.schoolAcademy.trim().length === 0) {
      errors.schoolAcademy = 'School or Academy name is required';
    }

    // 8. State
    if (!form.state || form.state.trim().length === 0) {
      errors.state = 'Please select or enter State';
    }

    // 9. District
    if (!form.district || form.district.trim().length === 0) {
      errors.district = 'District is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  async registerAthlete(form: AthleteRegistrationForm): Promise<Athlete> {
    const validation = await this.validateForm(form, false);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError ?? 'Validation failed');
    }

    return AthleteRepository.insert({
      id: form.id.trim(),
      name: form.name.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth.trim(),
      phone: form.phone?.trim() ?? null,
      heightCategory: form.heightCategory.trim(),
      coachName: form.coachName.trim(),
      schoolAcademy: form.schoolAcademy.trim(),
      state: form.state.trim(),
      district: form.district.trim(),
    });
  },

  async updateAthlete(form: AthleteRegistrationForm): Promise<Athlete> {
    const validation = await this.validateForm(form, true);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError ?? 'Validation failed');
    }

    return AthleteRepository.update(form.id.trim(), {
      name: form.name.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth.trim(),
      phone: form.phone?.trim() ?? null,
      heightCategory: form.heightCategory.trim(),
      coachName: form.coachName.trim(),
      schoolAcademy: form.schoolAcademy.trim(),
      state: form.state.trim(),
      district: form.district.trim(),
    });
  },

  async getAthletes(query?: string): Promise<Athlete[]> {
    if (query && query.trim().length > 0) {
      return AthleteRepository.findByNameOrId(query);
    }
    return AthleteRepository.getAll();
  },

  async getAthleteById(id: string): Promise<Athlete | null> {
    return AthleteRepository.findById(id);
  },
};
