import { Athlete, Session, NotificationItem, CoachProfile, AppSettings, TestResult } from '../types/app';

export const INITIAL_COACH_PROFILE: CoachProfile = {
  name: 'Rajesh Kumar',
  schoolName: 'Delhi Public School, R.K. Puram',
  phone: '', // Blank when unavailable per specification
  email: 'rajesh.kumar@dps.edu.in',
  designation: 'Senior Physical Education Coach (TIDC)',
  avatarInitials: 'RK',
};

export const STANDARD_10_TESTS = [
  { testId: 't1', testName: 'Height', category: 'Biometrics', unit: 'cm' },
  { testId: 't2', testName: 'Weight', category: 'Biometrics', unit: 'kg' },
  { testId: 't3', testName: 'Sit & Reach', category: 'Flexibility', unit: 'cm' },
  { testId: 't4', testName: 'Vertical Jump', category: 'Power', unit: 'cm' },
  { testId: 't5', testName: 'Broad Jump', category: 'Explosive Power', unit: 'cm' },
  { testId: 't6', testName: 'Sprint 30m', category: 'Speed', unit: 'sec' },
  { testId: 't7', testName: 'Shuttle Run', category: 'Agility', unit: 'sec' },
  { testId: 't8', testName: 'Sit Ups', category: 'Core Endurance', unit: 'reps' },
  { testId: 't9', testName: 'Endurance (600m)', category: 'Cardiovascular', unit: 'min:sec' },
  { testId: 't10', testName: 'BMI', category: 'Biometrics', unit: 'kg/m²' },
];

function generateMockTestResults(completedCount: number): TestResult[] {
  return STANDARD_10_TESTS.map((t, idx) => {
    const isComp = idx < completedCount;
    let sampleVal = '172';
    if (t.testName === 'Height') sampleVal = '172 cm';
    if (t.testName === 'Weight') sampleVal = '64 kg';
    if (t.testName === 'Sit & Reach') sampleVal = '24 cm';
    if (t.testName === 'Vertical Jump') sampleVal = '42 cm';
    if (t.testName === 'Broad Jump') sampleVal = '195 cm';
    if (t.testName === 'Sprint 30m') sampleVal = '4.32 s';
    if (t.testName === 'Shuttle Run') sampleVal = '10.1 s';
    if (t.testName === 'Sit Ups') sampleVal = '38 reps';
    if (t.testName === 'Endurance (600m)') sampleVal = '2:15 min';
    if (t.testName === 'BMI') sampleVal = '21.6';

    return {
      testId: t.testId,
      testName: t.testName,
      category: t.category,
      value: isComp ? sampleVal : 'Pending',
      unit: t.unit,
      score: isComp ? Math.floor(Math.random() * 4) + 7 : 0,
      isCompleted: isComp,
      statusDot: isComp ? 'green' : 'gray',
    };
  });
}

const mockSports = ['Athletics', 'Swimming', 'Football', 'Badminton', 'Basketball', 'Volleyball'] as const;
const mockSchools = ['Delhi Public School', 'St. Xavier High School', 'Army Public School', 'Modern School Vasant Vihar', 'Kendriya Vidyalaya'];

export const INITIAL_ATHLETES: Athlete[] = Array.from({ length: 250 }).map((_, i) => {
  const num = i + 1;
  const names = [
    'Aarav Sharma', 'Priya Nambiar', 'Rohan Mehta', 'Ananya Singh', 'Vikram Patel',
    'Sneha Reddy', 'Devansh Gupta', 'Isha Verma', 'Kabir Joshi', 'Diya Roy',
    'Arjun Nair', 'Kavya Kulkarni', 'Aditya Sen', 'Riya Kapoor', 'Siddharth Rao',
    'Tanya Malhotra', 'Manav Banerjee', 'Neha Saxena', 'Karan Bhatia', 'Meera Iyer'
  ];
  const name = `${names[i % names.length]} ${num > 20 ? num : ''}`.trim();
  const firstLetter = name.charAt(0).toUpperCase();
  const secondLetter = name.length > 1 ? name.charAt(1).toLowerCase() : '';
  const initials = `${firstLetter}${secondLetter}`;

  let completedCount = 10;
  let status: Athlete['status'] = 'Completed';
  if (i >= 142 && i < 160) {
    completedCount = Math.floor(Math.random() * 5) + 4; // 4 to 8
    status = 'In Progress';
  } else if (i >= 160) {
    completedCount = Math.floor(Math.random() * 4); // 0 to 3
    status = 'Pending';
  }

  const sport = mockSports[i % mockSports.length];
  const school = mockSchools[i % mockSchools.length];
  const age = 14 + (i % 5);

  return {
    id: `ath-${num}`,
    name,
    initials,
    age,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    school,
    sport,
    status,
    testsCompleted: completedCount,
    totalTests: 10,
    overallScore: Math.floor(Math.random() * 25) + 72,
    bmi: 20.5 + (i % 4),
    height: 160 + (i % 25),
    weight: 52 + (i % 20),
    assessmentDate: '04 Aug 2026',
    coachName: 'Rajesh Kumar',
    aiConfidence: 92,
    recommendations: [
      'Focus on endurance training — below average for age group',
      'Sprint drills 3× per week recommended',
      'Excellent flexibility — maintain with yoga sessions',
      'Maintain current BMI with balanced nutrition',
      'Hydration and post-workout active recovery advised',
    ],
    testResults: generateMockTestResults(completedCount),
    phone: `+91 98765 ${10000 + i}`,
    nsrsAadhaarId: `NSRS-2026-${1000 + i}`,
    createdAt: new Date().toISOString(),
  };
});

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess-101',
    sessionName: 'Morning Athletics Battery',
    schoolName: 'Delhi Public School',
    coachName: 'Rajesh Kumar',
    date: '04 Aug 2026',
    totalAthletes: 40,
    assessedCount: 32,
    status: 'In Progress',
    progressPercentage: 80,
  },
  {
    id: 'sess-102',
    sessionName: 'Football Squad Assessment',
    schoolName: 'St. Xavier High School',
    coachName: 'Rajesh Kumar',
    date: '03 Aug 2026',
    totalAthletes: 30,
    assessedCount: 30,
    status: 'Assessed',
    progressPercentage: 100,
  },
  {
    id: 'sess-103',
    sessionName: 'Swimming Group Fitness',
    schoolName: 'Modern School Vasant Vihar',
    coachName: 'Rajesh Kumar',
    date: '02 Aug 2026',
    totalAthletes: 25,
    assessedCount: 25,
    status: 'Assessed',
    progressPercentage: 100,
  },
  {
    id: 'sess-104',
    sessionName: 'Badminton & Basketball Selection',
    schoolName: 'Army Public School',
    coachName: 'Rajesh Kumar',
    date: '01 Aug 2026',
    totalAthletes: 35,
    assessedCount: 28,
    status: 'In Progress',
    progressPercentage: 80,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Offline data synced successfully',
    body: 'All pending athlete assessments have been synchronized successfully with the central server.',
    timestamp: 'Just now',
    isRead: false,
    type: 'sync_complete',
  },
  {
    id: 'notif-2',
    title: 'Assessment Complete',
    body: 'Athlete Aarav Sharma completed all 10 tests.',
    timestamp: '10 mins ago',
    isRead: false,
    type: 'assessment_complete',
  },
  {
    id: 'notif-3',
    title: 'Daily Summary Ready',
    body: '142 athletes completed today\'s assessment batch.',
    timestamp: '2 hours ago',
    isRead: true,
    type: 'batch_summary',
  },
  {
    id: 'notif-4',
    title: 'Internet connection restored',
    body: 'Connection restored. Auto-sync triggered.',
    timestamp: '3 hours ago',
    isRead: true,
    type: 'connection_restored',
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  language: 'English',
  privacyConsent: true,
  notificationsEnabled: true,
  offlineSyncEnabled: true,
  autoBackupEnabled: true,
  darkMode: false,
  notificationPreferences: {
    'Assessment completed': true,
    'Assessment pending': true,
    'Offline sync completed': true,
    'Internet restored': true,
    'New athlete added': true,
    'Assessment resumed': true,
    'Daily summary': true,
    'Weekly summary': true,
    'Low storage': false,
    'Backup successful': true,
  },
};
