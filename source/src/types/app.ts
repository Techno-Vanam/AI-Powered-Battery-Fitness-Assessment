export type AssessmentStatus = 'Completed' | 'Pending' | 'In Progress' | 'Active' | 'Assessed';

export type SportType = 'All' | 'Athletics' | 'Swimming' | 'Football' | 'Badminton' | 'Basketball' | 'Volleyball';

export interface TestResult {
  testId: string;
  testName: string;
  category: string;
  value: string;
  unit: string;
  score: number; // 0-10 score for individual test (used only inside profile test result row)
  isCompleted: boolean;
  statusDot: 'green' | 'gray';
  updatedAt?: string;
}

export interface Athlete {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  school: string;
  sport: SportType;
  status: AssessmentStatus;
  testsCompleted: number; // 0..10
  totalTests: number;     // Always 10
  overallScore?: number;  // 0..100 (Shown ONLY inside Athlete Profile stats row)
  bmi?: number;
  height?: number; // in cm
  weight?: number; // in kg
  assessmentDate?: string;
  coachName?: string;
  aiConfidence?: number;  // percentage e.g. 92
  recommendations?: string[];
  testResults: TestResult[];
  phone?: string;
  nsrsAadhaarId?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  sessionName: string;
  schoolName: string;
  coachName: string;
  date: string;
  totalAthletes: number;
  assessedCount: number;
  status: AssessmentStatus;
  progressPercentage: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: 'assessment_complete' | 'batch_summary' | 'connection_restored' | 'sync_complete' | 'offline_alert' | 'general';
}

export interface CoachProfile {
  name: string;
  schoolName: string;
  phone: string; // Leave blank if unavailable, do not show placeholder!
  email: string;
  designation: string;
  avatarInitials: string;
}

export interface AppSettings {
  language: 'English' | 'Hindi';
  privacyConsent: boolean;
  notificationsEnabled: boolean;
  offlineSyncEnabled: boolean;
  autoBackupEnabled: boolean;
  darkMode: boolean;
  notificationPreferences: Record<string, boolean>;
}

export type SortByOption = 'Name_AZ' | 'Name_ZA' | 'Age_Asc' | 'Age_Desc' | 'Completion_Asc' | 'Completion_Desc' | 'School' | 'Sport';

export interface FilterState {
  searchQuery: string;
  sport: SportType;
  sortBy: SortByOption;
  status: AssessmentStatus | 'All';
  school: string;
}
