import { HeightTest } from '../../database/repositories/HeightRepository';
import { Athlete } from '../../database/repositories/AthleteRepository';

export interface HeightTestWithAthlete {
  test: HeightTest;
  athlete: Athlete | null;
}

export type DateFilterOption = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';
export type SyncFilterOption = 'ALL' | 'PENDING' | 'UPLOADED' | 'FAILED';
