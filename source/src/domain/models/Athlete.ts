export interface AthleteRegistrationForm {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  dateOfBirth: string; // YYYY-MM-DD
  phone?: string;
  heightCategory: string;
  coachName: string;
  schoolAcademy: string;
  state: string;
  district: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof AthleteRegistrationForm, string>>;
}

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;

export const HEIGHT_CATEGORIES = [
  'Sub-Junior (Under-12)',
  'Junior (Under-15)',
  'Youth (Under-17)',
  'Junior (Under-19)',
  'Senior (Open)',
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR', 'Chandigarh',
] as const;
