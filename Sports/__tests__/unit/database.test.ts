import { AthleteRepository } from '../../src/database/repositories/AthleteRepository';
import { HeightRepository } from '../../src/database/repositories/HeightRepository';
import { VideoRepository } from '../../src/database/repositories/VideoRepository';
import { SyncRepository } from '../../src/database/repositories/SyncRepository';
import { openDatabase } from '../../src/database/database';

describe('Unit Tests - Database Repositories & Execution', () => {
  beforeAll(async () => {
    await openDatabase();
  });

  test('AthleteRepository CRUD operations', async () => {
    const athlete = await AthleteRepository.insert({
      name: 'Test Athlete',
      gender: 'male',
      dateOfBirth: '2005-01-01',
    });
    expect(athlete).toBeDefined();
    expect(athlete.id).toBeDefined();

    const found = await AthleteRepository.findById(athlete.id);
    expect(found).toBeDefined();

    const all = await AthleteRepository.getAll();
    expect(Array.isArray(all)).toBe(true);

    await AthleteRepository.delete(athlete.id);
  });

  test('HeightRepository CRUD operations', async () => {
    const record = await HeightRepository.insert({
      athleteId: 'ath-1',
      heightCm: 175.5,
      heightPixels: 700,
      markerScale: 0.25,
      markerConfidence: 85,
      poseConfidence: 85,
      overallConfidence: 85,
      deviceId: 'dev-1',
    });
    expect(record).toBeDefined();
    expect(record.id).toBeDefined();

    await HeightRepository.updateSyncStatus(record.id, 'uploaded');
    await HeightRepository.delete(record.id);
  });

  test('VideoRepository CRUD operations', async () => {
    const record = await VideoRepository.insert({
      athleteId: 'ath-1',
      localPath: '/path/to/vid.mp4',
      thumbnailPath: null,
      duration: 10,
      fileSize: 1024,
    });
    expect(record).toBeDefined();

    await VideoRepository.updateSyncStatus(record.id, 'uploaded');
    await VideoRepository.delete(record.id);
  });

  test('SyncRepository Queue operations', async () => {
    const queueItem = await SyncRepository.enqueue('athletes', 'rec-100', 'INSERT');
    expect(queueItem).toBeDefined();

    const pending = await SyncRepository.getPending(5);
    expect(Array.isArray(pending)).toBe(true);

    await SyncRepository.incrementRetry(queueItem.id);
    await SyncRepository.delete(queueItem.id);
  });
});
