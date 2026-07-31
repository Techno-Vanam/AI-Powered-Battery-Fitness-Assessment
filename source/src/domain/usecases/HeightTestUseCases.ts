import { HeightRepository, HeightTest, HeightTestInput } from '../../database/repositories/HeightRepository';
import { AthleteRepository, Athlete } from '../../database/repositories/AthleteRepository';
import { SyncRepository } from '../../database/repositories/SyncRepository';
import { HeightTestWithAthlete, DateFilterOption, SyncFilterOption } from '../models/HeightTest';

export const HeightTestUseCases = {
  async saveMeasurement(input: HeightTestInput): Promise<HeightTest> {
    const record = await HeightRepository.insert(input);
    // Enqueue for offline sync engine
    try {
      await SyncRepository.enqueue('height_tests', record.id, 'INSERT');
    } catch (e) {
      console.warn('[HeightTestUseCases] Sync enqueue warning:', e);
    }
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

      // 1. Text Query Filter (Athlete Name or Athlete ID)
      if (params.query && params.query.trim().length > 0) {
        const q = params.query.trim().toLowerCase();
        const nameMatch = athlete?.name.toLowerCase().includes(q) ?? false;
        const idMatch = test.athleteId.toLowerCase().includes(q);
        const customIdMatch = athlete?.id.toLowerCase().includes(q) ?? false;
        const schoolMatch = athlete?.schoolAcademy?.toLowerCase().includes(q) ?? false;

        if (!nameMatch && !idMatch && !customIdMatch && !schoolMatch) {
          return false;
        }
      }

      // 2. Date Filter
      if (params.dateFilter && params.dateFilter !== 'ALL') {
        const testDate = new Date(test.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (params.dateFilter === 'TODAY') {
          if (testDate.getTime() < today.getTime()) return false;
        } else if (params.dateFilter === 'WEEK') {
          if (now - test.createdAt > 7 * oneDayMs) return false;
        } else if (params.dateFilter === 'MONTH') {
          if (now - test.createdAt > 30 * oneDayMs) return false;
        }
      }

      // 3. Sync Status Filter
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

  async deleteMeasurement(id: string): Promise<void> {
    await HeightRepository.delete(id);
    try {
      await SyncRepository.deleteByRecord('height_tests', id);
    } catch (e) {
      // ignore
    }
  },
};
