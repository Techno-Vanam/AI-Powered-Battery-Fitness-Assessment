import { Athlete, HeightTest, SyncLog, ReportSummary } from '../types';

const API_BASE = 'http://localhost:8080/api/v1';

// Initial Mock Data Store
let mockAthletes: Athlete[] = [
  {
    id: 'ath-101',
    clientAthleteId: 'cli-ath-01',
    name: 'Aarav Sharma',
    gender: 'male',
    dateOfBirth: '2008-04-12',
    phone: '+91 98765 43210',
    heightCategory: 'U-18',
    coachName: 'Coach Vikram',
    schoolAcademy: 'Delhi Sports Excellence Academy',
    state: 'Delhi',
    district: 'New Delhi',
    createdAt: '2026-07-28T10:30:00',
    updatedAt: '2026-07-28T10:30:00',
  },
  {
    id: 'ath-102',
    clientAthleteId: 'cli-ath-02',
    name: 'Ananya Verma',
    gender: 'female',
    dateOfBirth: '2011-09-25',
    phone: '+91 98123 87654',
    heightCategory: 'U-15',
    coachName: 'Coach Vikram',
    schoolAcademy: 'Haryana Sports Complex',
    state: 'Haryana',
    district: 'Gurugram',
    createdAt: '2026-07-29T11:15:00',
    updatedAt: '2026-07-29T11:15:00',
  },
  {
    id: 'ath-103',
    clientAthleteId: 'cli-ath-03',
    name: 'Rohan Patel',
    gender: 'male',
    dateOfBirth: '2005-02-18',
    phone: '+91 99000 11223',
    heightCategory: 'Senior',
    coachName: 'Coach Suresh',
    schoolAcademy: 'Gujarat Athletic Institute',
    state: 'Gujarat',
    district: 'Ahmedabad',
    createdAt: '2026-07-29T14:20:00',
    updatedAt: '2026-07-29T14:20:00',
  },
  {
    id: 'ath-104',
    clientAthleteId: 'cli-ath-04',
    name: 'Priya Sundaram',
    gender: 'female',
    dateOfBirth: '2014-06-08',
    phone: '+91 97788 55443',
    heightCategory: 'U-12',
    coachName: 'Coach Vikram',
    schoolAcademy: 'Chennai Sports Foundation',
    state: 'Tamil Nadu',
    district: 'Chennai',
    createdAt: '2026-07-30T09:45:00',
    updatedAt: '2026-07-30T09:45:00',
  },
];

let mockHeightTests: HeightTest[] = [
  {
    id: 'test-301',
    clientMeasurementId: 'meas-001',
    athleteId: 'ath-101',
    athleteName: 'Aarav Sharma',
    heightCm: 178.4,
    heightPixels: 713.6,
    markerScale: 0.25,
    markerConfidence: 94,
    poseConfidence: 91,
    overallConfidence: 92,
    deviceId: 'Galaxy-Tab-S7',
    createdAt: '2026-07-30T16:30:00',
  },
  {
    id: 'test-302',
    clientMeasurementId: 'meas-002',
    athleteId: 'ath-102',
    athleteName: 'Ananya Verma',
    heightCm: 162.1,
    heightPixels: 648.4,
    markerScale: 0.25,
    markerConfidence: 96,
    poseConfidence: 93,
    overallConfidence: 94,
    deviceId: 'Galaxy-Tab-S7',
    createdAt: '2026-07-30T17:15:00',
  },
  {
    id: 'test-303',
    clientMeasurementId: 'meas-003',
    athleteId: 'ath-103',
    athleteName: 'Rohan Patel',
    heightCm: 184.2,
    heightPixels: 736.8,
    markerScale: 0.25,
    markerConfidence: 89,
    poseConfidence: 88,
    overallConfidence: 88,
    deviceId: 'Pixel-Tab-2',
    createdAt: '2026-07-30T17:45:00',
  },
  {
    id: 'test-304',
    clientMeasurementId: 'meas-004',
    athleteId: 'ath-104',
    athleteName: 'Priya Sundaram',
    heightCm: 148.5,
    heightPixels: 594.0,
    markerScale: 0.25,
    markerConfidence: 95,
    poseConfidence: 94,
    overallConfidence: 94,
    deviceId: 'Galaxy-Tab-S7',
    createdAt: '2026-07-30T18:10:00',
  },
];

let mockSyncLogs: SyncLog[] = [
  {
    id: 'sync-501',
    deviceId: 'Galaxy-Tab-S7',
    athleteCount: 2,
    heightTestCount: 3,
    skippedDuplicateCount: 0,
    syncedAt: '2026-07-30T18:15:00',
    status: 'SUCCESS',
  },
  {
    id: 'sync-502',
    deviceId: 'Pixel-Tab-2',
    athleteCount: 1,
    heightTestCount: 1,
    skippedDuplicateCount: 1,
    syncedAt: '2026-07-30T17:50:00',
    status: 'SUCCESS',
  },
];

export const apiService = {
  async getAthletes(): Promise<Athlete[]> {
    try {
      const res = await fetch(`${API_BASE}/athletes`);
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback to mock store
    }
    return [...mockAthletes];
  },

  async createAthlete(athlete: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>): Promise<Athlete> {
    const newAthlete: Athlete = {
      ...athlete,
      id: 'ath-' + (mockAthletes.length + 101),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAthletes.unshift(newAthlete);
    return newAthlete;
  },

  async getHeightTests(): Promise<HeightTest[]> {
    try {
      const res = await fetch(`${API_BASE}/height-tests`);
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback to mock store
    }
    return [...mockHeightTests];
  },

  async getSyncLogs(): Promise<SyncLog[]> {
    return [...mockSyncLogs];
  },

  async getReportSummary(): Promise<ReportSummary> {
    const totalAthletes = mockAthletes.length;
    const totalTests = mockHeightTests.length;
    const heights = mockHeightTests.map(h => h.heightCm);
    const avgHeight = heights.length > 0 ? Math.round((heights.reduce((a, b) => a + b, 0) / heights.length) * 10) / 10 : 0;
    const minHeight = heights.length > 0 ? Math.min(...heights) : 0;
    const maxHeight = heights.length > 0 ? Math.max(...heights) : 0;

    return {
      totalAthletesRegistered: totalAthletes,
      totalHeightTestsConducted: totalTests,
      averageHeightCm: avgHeight,
      minHeightCm: minHeight,
      maxHeightCm: maxHeight,
      distinctAthletesAssessed: totalAthletes,
    };
  },

  async triggerManualSync(): Promise<SyncLog> {
    const newLog: SyncLog = {
      id: 'sync-' + Date.now(),
      deviceId: 'Web-Admin-Console',
      athleteCount: 0,
      heightTestCount: 0,
      skippedDuplicateCount: 0,
      syncedAt: new Date().toISOString(),
      status: 'SUCCESS',
    };
    mockSyncLogs.unshift(newLog);
    return newLog;
  }
};
