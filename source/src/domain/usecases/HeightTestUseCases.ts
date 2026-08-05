import { HeightRepository, HeightTest, HeightTestInput } from '../../database/repositories/HeightRepository';
import { AthleteRepository, Athlete } from '../../database/repositories/AthleteRepository';
import { SyncRepository } from '../../database/repositories/SyncRepository';
import { HeightTestWithAthlete, DateFilterOption, SyncFilterOption } from '../models/HeightTest';
import { SyncManager } from '../../sync/SyncManager';

export const HeightTestUseCases = {
  /**
   * Save height locally (offline) and enqueue for cloud sync.
   * Uses client-generated measurementId for idempotent retries.
   */
  async saveMeasurement(
    input: HeightTestInput,
    athlete?: Athlete | null,
  ): Promise<HeightTest> {
    if (athlete) {
      const existing = await AthleteRepository.findById(athlete.id);
      if (!existing) {
        await AthleteRepository.insert({
          id: athlete.id,
          name: athlete.name,
          gender: athlete.gender,
          dateOfBirth: athlete.dateOfBirth,
          phone: athlete.phone,
          heightCategory: athlete.heightCategory,
          coachName: athlete.coachName,
          schoolAcademy: athlete.schoolAcademy,
          state: athlete.state,
          district: athlete.district,
        });
      }
      try {
        await SyncRepository.enqueue('athletes', athlete.id, 'INSERT');
      } catch (e) {
        console.warn('[HeightTestUseCases] Athlete sync enqueue warning:', e);
      }
    }

    const record = await HeightRepository.insert(input);
    try {
      await SyncRepository.enqueue('height_tests', record.measurementId, 'INSERT');
    } catch (e) {
      console.warn('[HeightTestUseCases] Sync enqueue warning:', e);
    }

    void SyncManager.triggerSync();

    return record;
  },

  async getFilteredHistory(params: {
    query?: string;
    dateFilter?: DateFilterOption;
    syncFilter?: SyncFilterOption;
  }): Promise<HeightTestWithAthlete[]> {
    const tests = await HeightRepository.getAll();
    const athleteCache = new Map<string, Athlete | null>();

    const rows: HeightTestWithAthlete[] = await Promise.all(
      tests.map(async test => {
        if (!athleteCache.has(test.athleteId)) {
          const athlete = await AthleteRepository.findById(test.athleteId);
          athleteCache.set(test.athleteId, athlete);
        }
        return {
          test,
          athlete: athleteCache.get(test.athleteId) ?? null,
        };
      }),
    );

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return rows.filter(item => {
      const { test, athlete } = item;

      if (params.query && params.query.trim().length > 0) {
        const q = params.query.trim().toLowerCase();
        const nameMatch = athlete?.name.toLowerCase().includes(q) ?? false;
        const idMatch = test.athleteId.toLowerCase().includes(q);
        if (!nameMatch && !idMatch) return false;
      }

      if (params.dateFilter && params.dateFilter !== 'ALL') {
        const testDate = new Date(test.timestamp);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (params.dateFilter === 'TODAY') {
          if (testDate.getTime() < today.getTime()) return false;
        } else if (params.dateFilter === 'WEEK') {
          if (now - test.timestamp > 7 * oneDayMs) return false;
        } else if (params.dateFilter === 'MONTH') {
          if (now - test.timestamp > 30 * oneDayMs) return false;
        }
      }

      if (params.syncFilter && params.syncFilter !== 'ALL') {
        if (params.syncFilter === 'PENDING' && test.syncStatus !== 'pending' && test.syncStatus !== 'retrying') {
          return false;
        }
        if (params.syncFilter === 'UPLOADED' && test.syncStatus !== 'uploaded') {
          return false;
        }
        if (params.syncFilter === 'FAILED' && test.syncStatus !== 'failed') {
          return false;
        }
      }

      return true;
    });
  },

  async deleteMeasurement(measurementId: string): Promise<void> {
    await HeightRepository.delete(measurementId);
    try {
      await SyncRepository.deleteByRecord('height_tests', measurementId);
    } catch {
      // ignore
    }
  },
};
