// ─── Hindi (हिन्दी) translations ──────────────────────────────────────────────
import { TranslationKey } from './en';

const hi: Record<TranslationKey, string> = {
  // ── Greetings ──────────────────────────────────────────────────────────────
  greeting_morning: 'शुभ प्रभात,',
  greeting_afternoon: 'शुभ दोपहर,',
  greeting_evening: 'शुभ संध्या,',

  // ── Bottom Tab Bar ─────────────────────────────────────────────────────────
  tab_home: 'होम',
  tab_athletes: 'खिलाड़ी',
  tab_assess: 'मूल्यांकन',
  tab_reports: 'रिपोर्ट',
  tab_settings: 'सेटिंग्स',

  // ── Home Screen ────────────────────────────────────────────────────────────
  stat_total_athletes: 'कुल खिलाड़ी',
  stat_total_assessments: 'कुल मूल्यांकन',
  stat_pending_assessments: 'लंबित मूल्यांकन',
  stat_completed_assessments: 'पूर्ण मूल्यांकन',
  quick_actions: 'त्वरित क्रियाएं',
  add_athlete: 'खिलाड़ी जोड़ें',
  add_athlete_sub: 'नया खिलाड़ी पंजीकृत करें',
  view_athletes: 'खिलाड़ी देखें',
  view_athletes_sub: 'सभी खिलाड़ी ब्राउज़ करें',
  recent_sessions: 'हाल के सत्र',
  view_all: 'सभी देखें',
  athletes_assessed: 'खिलाड़ी मूल्यांकित',
  complete: '% पूर्ण',

  // ── Settings Screen ────────────────────────────────────────────────────────
  settings: 'सेटिंग्स',
  general_settings: 'सामान्य सेटिंग्स',
  language: 'भाषा',
  privacy_consent: 'गोपनीयता और सहमति',
  offline_sync: 'ऑफलाइन सिंक',
  auto_backup: 'स्वतः बैकअप',
  dark_mode: 'डार्क मोड',
  notification_preferences: 'सूचना प्राथमिकताएं',
  app_info: 'ऐप जानकारी',
  about_app: 'ऐप के बारे में',
  help_support: 'सहायता और समर्थन',
  terms_conditions: 'नियम और शर्तें',
  app_version: 'ऐप संस्करण',
  account_actions: 'खाता क्रियाएं',
  sign_out: 'साइन आउट',
  delete_account: 'खाता हटाएं',
  delete_account_confirm: 'क्या आप वाकई अपनी कोच प्रोफ़ाइल और मूल्यांकन रिकॉर्ड स्थायी रूप से हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
  cancel: 'रद्द करें',
  delete: 'हटाएं',
  save_profile: 'प्रोफ़ाइल सहेजें',
  field_name: 'नाम',
  field_school: 'स्कूल का नाम',
  field_phone: 'फ़ोन नंबर',
  field_phone_placeholder: 'यदि उपलब्ध नहीं है तो खाली छोड़ें',
  field_email: 'ईमेल',
  field_designation: 'पदनाम',

  // Notification preference keys
  notif_assessment_completed: 'मूल्यांकन पूर्ण हुआ',
  notif_assessment_pending: 'मूल्यांकन लंबित है',
  notif_offline_sync: 'ऑफलाइन सिंक पूर्ण',
  notif_internet_restored: 'इंटरनेट बहाल हुआ',
  notif_new_athlete: 'नया खिलाड़ी जोड़ा गया',
  notif_assessment_resumed: 'मूल्यांकन फिर शुरू हुआ',
  notif_daily_summary: 'दैनिक सारांश',
  notif_weekly_summary: 'साप्ताहिक सारांश',
  notif_low_storage: 'कम भंडारण',
  notif_backup_successful: 'बैकअप सफल',

  // ── Language Selection Screen ──────────────────────────────────────────────
  language_selection: 'भाषा चयन',
  lang_english: 'English (डिफ़ॉल्ट)',
  lang_hindi: 'हिन्दी (Hindi)',

  // ── About App Screen ───────────────────────────────────────────────────────
  about_title: 'ऐप के बारे में',
  about_version: 'संस्करण',
  about_build: 'बिल्ड',
  about_description: 'AI-पावर्ड बैटरी फिटनेस असेसमेंट एक व्यापक खेल प्रदर्शन मूल्यांकन प्लेटफ़ॉर्म है जो भारत भर के कोच, पीई शिक्षकों और खेल अकादमियों के लिए डिज़ाइन किया गया है।',

  // ── Privacy Consent Screen ─────────────────────────────────────────────────
  privacy_title: 'गोपनीयता और सहमति',
  privacy_body: 'आपका डेटा सुरक्षित रूप से संग्रहीत किया जाता है और केवल खिलाड़ी फिटनेस मूल्यांकन उद्देश्यों के लिए उपयोग किया जाता है। हम व्यक्तिगत डेटा तृतीय पक्षों के साथ साझा नहीं करते।',
  consent_given: 'सहमति दी गई',
  consent_revoke: 'सहमति वापस लें',
  grant_consent: 'सहमति दें',

  // ── Athletes Screen ────────────────────────────────────────────────────────
  search_athletes: 'खिलाड़ी खोजें...',
  all_athletes: 'सभी खिलाड़ी',
  filter: 'फ़िल्टर',
  sort: 'क्रमबद्ध करें',
  no_athletes_found: 'कोई खिलाड़ी नहीं मिला',
  athlete_profile: 'खिलाड़ी प्रोफ़ाइल',

  // ── Athlete Profile ────────────────────────────────────────────────────────
  tests_completed: 'परीक्षण पूर्ण',
  overall_score: 'कुल स्कोर',
  fitness_grade: 'फिटनेस ग्रेड',
  bmi_label: 'बीएमआई',
  age_label: 'आयु',
  gender_label: 'लिंग',
  school_label: 'स्कूल',
  sport_label: 'खेल',
  height_label: 'ऊंचाई',
  weight_label: 'वजन',
  test_results: 'परीक्षण परिणाम',
  ai_recommendations: 'AI सुझाव',
  ai_confidence: 'AI विश्वास',
  view_report: 'रिपोर्ट देखें',
  generate_report: 'रिपोर्ट बनाएं',
  status_completed: 'पूर्ण',
  status_in_progress: 'जारी है',
  status_pending: 'लंबित',

  // ── Report Screens ─────────────────────────────────────────────────────────
  reports: 'रिपोर्ट',
  report_card: 'रिपोर्ट कार्ड',
  athlete_report: 'खिलाड़ी रिपोर्ट',
  scan_to_view: 'देखने के लिए स्कैन करें',
  complete_digital_report: 'पूर्ण डिजिटल रिपोर्ट और वीडियो रिकॉर्ड',
  physical_profile: 'शारीरिक प्रोफ़ाइल',
  performance_radar: 'प्रदर्शन रडार',
  overall_performance: 'समग्र प्रदर्शन',
  fitness_score: 'फिटनेस स्कोर',
  fitness_grade_label: 'फिटनेस ग्रेड',
  battery_test_results: 'बैटरी फिटनेस परीक्षण परिणाम',
  high_potential: 'उच्च क्षमता',
  download_report: 'रिपोर्ट डाउनलोड करें',
  share_report: 'रिपोर्ट शेयर करें',
  close: 'बंद करें',

  // ── Assessment Screens ─────────────────────────────────────────────────────
  assessments: 'मूल्यांकन',
  assessment_progress: 'मूल्यांकन प्रगति',
  start_assessment: 'मूल्यांकन शुरू करें',
  continue_assessment: 'मूल्यांकन जारी रखें',
  complete_assessment: 'मूल्यांकन पूर्ण करें',
  test_details: 'परीक्षण विवरण',
  enter_value: 'मान दर्ज करें',
  save: 'सहेजें',
  back: 'वापस',
  score: 'स्कोर',
  unit: 'इकाई',
  status: 'स्थिति',
  verified: 'सत्यापित',
  pending: 'लंबित',

  // ── Notification Screen ────────────────────────────────────────────────────
  notifications: 'सूचनाएं',
  no_notifications: 'अभी तक कोई सूचना नहीं',
  mark_all_read: 'सभी पढ़े हुए चिह्नित करें',

  // ── Sync / Connectivity ────────────────────────────────────────────────────
  offline_mode: 'ऑफलाइन मोड',
  syncing: 'सिंक हो रहा है...',
  sync_complete: 'सिंक पूर्ण',
  sync_now: 'अभी सिंक करें',
  online: 'ऑनलाइन',
  offline: 'ऑफलाइन',

  // ── Login Screen ───────────────────────────────────────────────────────────
  login_title: 'कोच लॉगिन',
  login_subtitle: 'अपने खाते में साइन इन करें',
  phone_number: 'फ़ोन नंबर',
  send_otp: 'OTP भेजें',
  enter_otp: 'OTP दर्ज करें',
  verify_otp: 'OTP सत्यापित करें',
  resend_otp: 'OTP पुनः भेजें',
  dont_have_account: 'खाता नहीं है?',
  register: 'पंजीकरण करें',
  already_have_account: 'पहले से खाता है?',
  login: 'लॉगिन',
};

export default hi;
