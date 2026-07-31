export type TestStatus = 'completed' | 'pending' | 'in_progress';

export type DashboardTest = {
  id: string;
  key: string;
  name: string;
  status: TestStatus;
  score: string | null;
  confidence: number | null;
  attempts: number;
  maxAttempts: number;
  bestAttempt: string | null;
  estimatedMinutes: number;
  icon: string;
};

export type AthleteProfile = {
  name: string;
  athleteId: string;
  age: number;
  gender: string;
  institution: string;
  photoUrl: string | null;
};

export type GreetingInfo = {
  lastAssessmentDate: string | null;
  completedTests: number;
  totalTests: number;
  statusLabel: string;
};

export type ProgressInfo = {
  percent: number;
  completed: number;
  remaining: number;
};

export type CurrentTestInfo = {
  testId: string;
  name: string;
  status: TestStatus;
  attemptsRemaining: number;
  estimatedMinutes: number;
} | null;

export type LatestResultInfo = {
  testName: string;
  score: string;
  confidence: number;
  completedAt: string;
  minutesAgo: number;
} | null;

export type PerformanceMetric = {
  key: string;
  label: string;
  value: string;
  unit?: string;
};

export type AiInsightsInfo = {
  summary: string;
  overallConfidence: number;
};

export type AccuracyItem = {
  category: string;
  confidence: number;
};

export type HistoryItem = {
  id: string;
  date: string;
  status: 'completed' | 'in_progress' | 'incomplete';
  label: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
};

export type SyncCentreInfo = {
  pendingVideos: number;
  pendingResults: number;
  pendingReports: number;
  lastSyncAt: string | null;
};

export type AthleteDashboardData = {
  profile: AthleteProfile;
  greeting: GreetingInfo;
  progress: ProgressInfo;
  currentTest: CurrentTestInfo;
  tests: DashboardTest[];
  latestResult: LatestResultInfo;
  performance: PerformanceMetric[];
  aiInsights: AiInsightsInfo;
  accuracy: {
    overall: number;
    items: AccuracyItem[];
  };
  history: HistoryItem[];
  achievements: Achievement[];
  sync: SyncCentreInfo;
};
