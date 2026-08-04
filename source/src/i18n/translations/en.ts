// ─── English (default) translations ──────────────────────────────────────────
const en = {
  // ── Greetings ──────────────────────────────────────────────────────────────
  greeting_morning: 'Good morning,',
  greeting_afternoon: 'Good afternoon,',
  greeting_evening: 'Good evening,',

  // ── Bottom Tab Bar ─────────────────────────────────────────────────────────
  tab_home: 'Home',
  tab_athletes: 'Athletes',
  tab_assess: 'Assess',
  tab_reports: 'Reports',
  tab_settings: 'Settings',

  // ── Home Screen ────────────────────────────────────────────────────────────
  stat_total_athletes: 'Total Athletes',
  stat_total_assessments: 'Total Assessments',
  stat_pending_assessments: 'Pending Assessments',
  stat_completed_assessments: 'Completed Assessments',
  quick_actions: 'Quick Actions',
  add_athlete: 'Add Athlete',
  add_athlete_sub: 'Register a new athlete',
  view_athletes: 'View Athletes',
  view_athletes_sub: 'Browse all athletes',
  recent_sessions: 'Recent Sessions',
  view_all: 'View All',
  athletes_assessed: 'Athletes Assessed',
  complete: '% complete',

  // ── Settings Screen ────────────────────────────────────────────────────────
  settings: 'Settings',
  general_settings: 'General Settings',
  language: 'Language',
  privacy_consent: 'Privacy & Consent',
  offline_sync: 'Offline Sync',
  auto_backup: 'Auto Backup',
  dark_mode: 'Dark Mode',
  notification_preferences: 'Notification Preferences',
  app_info: 'App Info',
  about_app: 'About App',
  help_support: 'Help & Support',
  terms_conditions: 'Terms & Conditions',
  app_version: 'App Version',
  account_actions: 'Account Actions',
  sign_out: 'Sign Out',
  delete_account: 'Delete Account',
  delete_account_confirm: 'Are you sure you want to permanently delete your coach profile and assessment records? This action cannot be undone.',
  cancel: 'Cancel',
  delete: 'Delete',
  save_profile: 'Save Profile',
  field_name: 'Name',
  field_school: 'School Name',
  field_phone: 'Phone Number',
  field_phone_placeholder: 'Leave blank if unavailable',
  field_email: 'Email',
  field_designation: 'Designation',

  // Notification preference keys
  notif_assessment_completed: 'Assessment completed',
  notif_assessment_pending: 'Assessment pending',
  notif_offline_sync: 'Offline sync completed',
  notif_internet_restored: 'Internet restored',
  notif_new_athlete: 'New athlete added',
  notif_assessment_resumed: 'Assessment resumed',
  notif_daily_summary: 'Daily summary',
  notif_weekly_summary: 'Weekly summary',
  notif_low_storage: 'Low storage',
  notif_backup_successful: 'Backup successful',

  // ── Language Selection Screen ──────────────────────────────────────────────
  language_selection: 'Language Selection',
  lang_english: 'English (Default)',
  lang_hindi: 'हिन्दी (Hindi)',

  // ── About App Screen ───────────────────────────────────────────────────────
  about_title: 'About App',
  about_version: 'Version',
  about_build: 'Build',
  about_description: 'AI-Powered Battery Fitness Assessment is a comprehensive sports performance evaluation platform designed for coaches, PE teachers, and sports academies across India.',

  // ── Privacy Consent Screen ─────────────────────────────────────────────────
  privacy_title: 'Privacy & Consent',
  privacy_body: 'Your data is securely stored and used only for athlete fitness assessment purposes. We do not share personal data with third parties.',
  consent_given: 'Consent Given',
  consent_revoke: 'Revoke Consent',
  grant_consent: 'Grant Consent',

  // ── Athletes Screen ────────────────────────────────────────────────────────
  search_athletes: 'Search athletes...',
  all_athletes: 'All Athletes',
  filter: 'Filter',
  sort: 'Sort',
  no_athletes_found: 'No athletes found',
  athlete_profile: 'Athlete Profile',

  // ── Athlete Profile ────────────────────────────────────────────────────────
  tests_completed: 'Tests Completed',
  overall_score: 'Overall Score',
  fitness_grade: 'Fitness Grade',
  bmi_label: 'BMI',
  age_label: 'Age',
  gender_label: 'Gender',
  school_label: 'School',
  sport_label: 'Sport',
  height_label: 'Height',
  weight_label: 'Weight',
  test_results: 'Test Results',
  ai_recommendations: 'AI Recommendations',
  ai_confidence: 'AI Confidence',
  view_report: 'View Report',
  generate_report: 'Generate Report',
  status_completed: 'Completed',
  status_in_progress: 'In Progress',
  status_pending: 'Pending',

  // ── Report Screens ─────────────────────────────────────────────────────────
  reports: 'Reports',
  report_card: 'Report Card',
  athlete_report: 'Athlete Report',
  scan_to_view: 'SCAN TO VIEW',
  complete_digital_report: 'COMPLETE DIGITAL REPORT & VIDEO RECORDS',
  physical_profile: 'Physical Profile',
  performance_radar: 'Performance Radar',
  overall_performance: 'Overall Performance',
  fitness_score: 'Fitness Score',
  fitness_grade_label: 'Fitness Grade',
  battery_test_results: 'Battery Fitness Test Results',
  high_potential: 'High Potential',
  download_report: 'Download Report',
  share_report: 'Share Report',
  close: 'Close',

  // ── Assessment Screens ─────────────────────────────────────────────────────
  assessments: 'Assessments',
  assessment_progress: 'Assessment Progress',
  start_assessment: 'Start Assessment',
  continue_assessment: 'Continue Assessment',
  complete_assessment: 'Complete Assessment',
  test_details: 'Test Details',
  enter_value: 'Enter Value',
  save: 'Save',
  back: 'Back',
  score: 'Score',
  unit: 'Unit',
  status: 'Status',
  verified: 'Verified',
  pending: 'Pending',

  // ── Notification Screen ────────────────────────────────────────────────────
  notifications: 'Notifications',
  no_notifications: 'No notifications yet',
  mark_all_read: 'Mark All Read',

  // ── Sync / Connectivity ────────────────────────────────────────────────────
  offline_mode: 'Offline Mode',
  syncing: 'Syncing...',
  sync_complete: 'Sync Complete',
  sync_now: 'Sync Now',
  online: 'Online',
  offline: 'Offline',

  // ── Login Screen ───────────────────────────────────────────────────────────
  login_title: 'Coach Login',
  login_subtitle: 'Sign in to your account',
  phone_number: 'Phone Number',
  send_otp: 'Send OTP',
  enter_otp: 'Enter OTP',
  verify_otp: 'Verify OTP',
  resend_otp: 'Resend OTP',
  dont_have_account: "Don't have an account?",
  register: 'Register',
  already_have_account: 'Already have an account?',
  login: 'Login',
};

export default en;
export type TranslationKey = keyof typeof en;
