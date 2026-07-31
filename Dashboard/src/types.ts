export interface Athlete {
  id: string;
  clientAthleteId: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  phone: string;
  heightCategory: 'U-12' | 'U-15' | 'U-18' | 'Senior';
  coachName: string;
  schoolAcademy: string;
  state: string;
  district: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeightTest {
  id: string;
  clientMeasurementId: string;
  athleteId: string;
  athleteName?: string;
  heightCm: number;
  heightPixels: number;
  markerScale: number;
  markerConfidence: number;
  poseConfidence: number;
  overallConfidence: number;
  deviceId: string;
  createdAt: string;
}

export interface SyncLog {
  id: string;
  deviceId: string;
  athleteCount: number;
  heightTestCount: number;
  skippedDuplicateCount: number;
  syncedAt: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}

export interface ReportSummary {
  totalAthletesRegistered: number;
  totalHeightTestsConducted: number;
  averageHeightCm: number;
  minHeightCm: number;
  maxHeightCm: number;
  distinctAthletesAssessed: number;
}

export type ActiveTab = 'analytics' | 'athletes' | 'history' | 'sync';
