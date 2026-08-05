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
      measurementId: '550e8400-e29b-41d4-a716-446655440000',
      athleteId: 'ath-1',
      teamId: null,
      sessionId: null,
      heightCm: 175.5,
      confidence: 85,
      deviceModel: 'Test Device',
      timestamp: Date.now(),
      calibrationMethod: 'aruco_15cm',
      stableFrameCount: 10,
      videoDurationSec: 15,
      pixelsPerCm: 10,
    });
    expect(record).toBeDefined();
    expect(record.measurementId).toBeDefined();

    await HeightRepository.updateSyncStatus(record.measurementId, 'uploaded');
    await HeightRepository.delete(record.measurementId);
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

    const pending = await SyncRepository.getPending();
    expect(Array.isArray(pending)).toBe(true);

    await SyncRepository.incrementRetry(queueItem.id);
    await SyncRepository.delete(queueItem.id);
  });
});
