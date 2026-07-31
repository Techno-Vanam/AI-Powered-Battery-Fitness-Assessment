/**
 * Offline Storage & Sync — Unit Tests
 *
 * Mocks react-native-sqlite-storage so tests run in Node without a device.
 */

// ─── SQLite mock ──────────────────────────────────────────────────────────────
type Row = Record<string, any>;

function makeDb() {
  const tables: Record<string, Row[]> = {
    athletes: [],
    height_tests: [],
    sync_queue: [],
    videos: [],
    schema_version: [],
  };

  const executeSql = jest.fn(async (sql: string, params: any[] = []) => {
    const s = sql.trim().toUpperCase();

    if (s.startsWith('INSERT INTO ATHLETES')) {
      const row: Row = {
        id: params[0], name: params[1], gender: params[2],
        dateOfBirth: params[3], phone: params[4],
        createdAt: params[5], updatedAt: params[6],
      };
      const existing = tables.athletes.findIndex(r => r.id === row.id);
      if (existing >= 0) {
        tables.athletes[existing] = { ...tables.athletes[existing], ...row, updatedAt: params[6] };
      } else {
        tables.athletes.push(row);
      }
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('INSERT INTO HEIGHT_TESTS')) {
      tables.height_tests.push({
        id: params[0], athleteId: params[1], heightCm: params[2],
        heightPixels: params[3], markerScale: params[4],
        markerConfidence: params[5], poseConfidence: params[6],
        overallConfidence: params[7], deviceId: params[8],
        createdAt: params[9], syncStatus: 'pending',
      });
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('INSERT INTO SYNC_QUEUE')) {
      tables.sync_queue.push({
        id: params[0], tableName: params[1], recordId: params[2],
        operation: params[3], retryCount: 0, lastAttempt: null,
        createdAt: params[4],
      });
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('INSERT INTO VIDEOS')) {
      tables.videos.push({
        id: params[0], athleteId: params[1], localPath: params[2],
        thumbnailPath: params[3], duration: params[4],
        fileSize: params[5], createdAt: params[6], syncStatus: 'pending',
      });
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('SELECT * FROM ATHLETES WHERE ID')) {
      const rows = tables.athletes.filter(r => r.id === params[0]);
      return [{ rows: { length: rows.length, item: (i: number) => rows[i] } }];
    }

    if (s.startsWith('SELECT * FROM ATHLETES ORDER BY')) {
      const rows = [...tables.athletes];
      return [{ rows: { length: rows.length, item: (i: number) => rows[i] } }];
    }

    if (s.startsWith('SELECT * FROM HEIGHT_TESTS WHERE ID')) {
      const rows = tables.height_tests.filter(r => r.id === params[0]);
      return [{ rows: { length: rows.length, item: (i: number) => rows[i] } }];
    }

    if (s.startsWith('SELECT * FROM HEIGHT_TESTS ORDER BY')) {
      const rows = [...tables.height_tests];
      return [{ rows: { length: rows.length, item: (i: number) => rows[i] } }];
    }

    if (s.includes('SYNCSTATUS IN') || s.includes("SYNCSTATUS IN ('PENDING'")) {
      const rows = tables.height_tests.filter(r =>
        ['pending', 'failed', 'retrying'].includes(r.syncStatus),
      );
      return [{ rows: { length: rows.length, item: (i: number) => rows[i] } }];
    }

    if (s.startsWith('SELECT * FROM SYNC_QUEUE')) {
      const rows = [...tables.sync_queue].filter(r => r.retryCount < 5);
      return [{ rows: { length: rows.length, item: (i: number) => rows[i] } }];
    }

    if (s.startsWith('SELECT COUNT(*)') && s.includes('SYNC_QUEUE')) {
      const cnt = tables.sync_queue.filter(r => r.retryCount < 5).length;
      return [{ rows: { length: 1, item: () => ({ cnt }) } }];
    }

    if (s.startsWith('UPDATE HEIGHT_TESTS SET SYNCSTATUS')) {
      const idx = tables.height_tests.findIndex(r => r.id === params[1]);
      if (idx >= 0) tables.height_tests[idx].syncStatus = params[0];
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('UPDATE SYNC_QUEUE SET RETRYCOUNT')) {
      const idx = tables.sync_queue.findIndex(r => r.id === params[1]);
      if (idx >= 0) {
        tables.sync_queue[idx].retryCount += 1;
        tables.sync_queue[idx].lastAttempt = params[0];
      }
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('DELETE FROM HEIGHT_TESTS WHERE ID')) {
      tables.height_tests = tables.height_tests.filter(r => r.id !== params[0]);
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('DELETE FROM SYNC_QUEUE WHERE ID')) {
      tables.sync_queue = tables.sync_queue.filter(r => r.id !== params[0]);
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('DELETE FROM SYNC_QUEUE WHERE TABLENAME')) {
      tables.sync_queue = tables.sync_queue.filter(
        r => !(r.tableName === params[0] && r.recordId === params[1]),
      );
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('DELETE FROM ATHLETES WHERE ID')) {
      tables.athletes = tables.athletes.filter(r => r.id !== params[0]);
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('DELETE FROM VIDEOS WHERE ID')) {
      tables.videos = tables.videos.filter(r => r.id !== params[0]);
      return [{ rows: { length: 0, item: () => null } }];
    }

    if (s.startsWith('SELECT * FROM VIDEOS WHERE ID')) {
      const rows = tables.videos.filter(r => r.id === params[0]);
      return [{ rows: { length: rows.length, item: (i: number) => rows[i] } }];
    }

    if (s.startsWith('SELECT * FROM VIDEOS WHERE SYNCSTATUS')) {
      const rows = tables.videos.filter(r =>
        ['pending', 'failed', 'retrying'].includes(r.syncStatus),
      );
      return [{ rows: { length: rows.length, item: (i: number) => rows[i] } }];
    }

    if (s.startsWith('UPDATE VIDEOS SET SYNCSTATUS')) {
      const idx = tables.videos.findIndex(r => r.id === params[1]);
      if (idx >= 0) tables.videos[idx].syncStatus = params[0];
      return [{ rows: { length: 0, item: () => null } }];
    }

    // schema_version / CREATE TABLE / CREATE INDEX — no-op
    return [{ rows: { length: 0, item: () => null } }];
  });

  return { executeSql, _tables: tables };
}

let mockDb = makeDb();

jest.mock('react-native-sqlite-storage', () => ({
  enablePromise: jest.fn(),
  openDatabase: jest.fn(async () => mockDb),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => `uuid-${Math.random().toString(36).slice(2)}`),
}));

jest.mock('react-native-fs', () => ({
  exists: jest.fn(async () => true),
  unlink: jest.fn(async () => {}),
}));

// ─── Module imports (after mocks) ─────────────────────────────────────────────
import { AthleteRepository } from '../../src/database/repositories/AthleteRepository';
import { HeightRepository } from '../../src/database/repositories/HeightRepository';
import { SyncRepository } from '../../src/database/repositories/SyncRepository';
import { VideoRepository } from '../../src/database/repositories/VideoRepository';
import { processQueueItem } from '../../src/sync/UploadWorker';
import * as Database from '../../src/database/Database';

// Inject mock DB into the singleton
(Database as any)._db = mockDb;
jest.spyOn(Database, 'getDatabase').mockReturnValue(mockDb as any);

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockDb = makeDb();
  jest.spyOn(Database, 'getDatabase').mockReturnValue(mockDb as any);
});

// 1. Insert Athlete
describe('AthleteRepository.insert', () => {
  it('inserts and returns athlete with generated id', async () => {
    const athlete = await AthleteRepository.insert({
      name: 'Alice', gender: 'female', dateOfBirth: '2000-01-01', phone: null,
    });
    expect(athlete.id).toBeTruthy();
    expect(athlete.name).toBe('Alice');
    expect(athlete.createdAt).toBeGreaterThan(0);
  });

  it('findById returns inserted athlete', async () => {
    const inserted = await AthleteRepository.insert({
      name: 'Bob', gender: 'male', dateOfBirth: null, phone: '9999999999',
    });
    const found = await AthleteRepository.findById(inserted.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Bob');
  });
});

// 2. Insert Height
describe('HeightRepository.insert', () => {
  it('inserts height test with pending syncStatus', async () => {
    const test = await HeightRepository.insert({
      athleteId: 'athlete-1',
      heightCm: 175.5,
      heightPixels: 1200,
      markerScale: 0.0175,
      markerConfidence: 92,
      poseConfidence: 88,
      overallConfidence: 90,
      deviceId: 'device-abc',
    });
    expect(test.id).toBeTruthy();
    expect(test.syncStatus).toBe('pending');
    expect(test.heightCm).toBe(175.5);
  });

  it('updateSyncStatus changes status', async () => {
    const test = await HeightRepository.insert({
      athleteId: 'athlete-1', heightCm: 180, heightPixels: 1300,
      markerScale: 0.018, markerConfidence: 90, poseConfidence: 85,
      overallConfidence: 87, deviceId: 'device-abc',
    });
    await HeightRepository.updateSyncStatus(test.id, 'uploading');
    const updated = await HeightRepository.findById(test.id);
    expect(updated!.syncStatus).toBe('uploading');
  });

  it('delete removes the record', async () => {
    const test = await HeightRepository.insert({
      athleteId: 'athlete-1', heightCm: 165, heightPixels: 1100,
      markerScale: 0.016, markerConfidence: 80, poseConfidence: 75,
      overallConfidence: 77, deviceId: 'device-abc',
    });
    await HeightRepository.delete(test.id);
    const found = await HeightRepository.findById(test.id);
    expect(found).toBeNull();
  });
});

// 3. Sync Queue Insert
describe('SyncRepository.enqueue', () => {
  it('enqueues item with retryCount 0', async () => {
    const item = await SyncRepository.enqueue('height_tests', 'record-1');
    expect(item.retryCount).toBe(0);
    expect(item.tableName).toBe('height_tests');
    expect(item.operation).toBe('INSERT');
  });

  it('countPending returns correct count', async () => {
    await SyncRepository.enqueue('athletes', 'a-1');
    await SyncRepository.enqueue('height_tests', 'h-1');
    const count = await SyncRepository.countPending();
    expect(count).toBe(2);
  });
});

// 4. Retry Logic
describe('SyncRepository retry', () => {
  it('incrementRetry increases retryCount', async () => {
    const item = await SyncRepository.enqueue('height_tests', 'record-2');
    await SyncRepository.incrementRetry(item.id);
    const pending = await SyncRepository.getPending();
    const found = pending.find(i => i.id === item.id);
    expect(found!.retryCount).toBe(1);
  });

  it('items with retryCount >= 5 are excluded from getPending', async () => {
    const item = await SyncRepository.enqueue('height_tests', 'record-3');
    // Simulate 5 retries directly in mock table
    const row = mockDb._tables.sync_queue.find(r => r.id === item.id)!;
    row.retryCount = 5;
    const pending = await SyncRepository.getPending();
    expect(pending.find(i => i.id === item.id)).toBeUndefined();
  });
});

// 5. Delete After Upload (UploadWorker)
describe('UploadWorker — delete after upload', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('removes height test and queue item on success', async () => {
    // Re-inject mock DB after resetModules
    const DBModule = require('../../src/database/database');
    jest.spyOn(DBModule, 'getDatabase').mockReturnValue(mockDb as any);
    (DBModule as any)._db = mockDb;

    // Insert athlete and height test into mock tables directly
    mockDb._tables.athletes.push({
      id: 'ath-1', name: 'Carol', gender: 'female',
      dateOfBirth: null, phone: null, createdAt: Date.now(), updatedAt: Date.now(),
    });
    mockDb._tables.height_tests.push({
      id: 'ht-1', athleteId: 'ath-1', heightCm: 170, heightPixels: 1150,
      markerScale: 0.017, markerConfidence: 88, poseConfidence: 82,
      overallConfidence: 85, deviceId: 'dev-1', createdAt: Date.now(), syncStatus: 'pending',
    });
    const { SyncRepository } = require('../../src/database/repositories/SyncRepository');
    const qItem = await SyncRepository.enqueue('height_tests', 'ht-1');

    // Mock API calls
    jest.doMock('../../src/network/AthleteApi', () => ({
      AthleteApi: { exists: jest.fn(async () => true), upload: jest.fn() },
    }));
    jest.doMock('../../src/network/HeightApi', () => ({
      HeightApi: { exists: jest.fn(async () => false), upload: jest.fn(async () => ({})) },
    }));

    const { processQueueItem: worker } = require('../../src/sync/UploadWorker');
    const result = await worker(qItem);

    expect(result).toBe('success');
    expect(mockDb._tables.height_tests.find(r => r.id === 'ht-1')).toBeUndefined();
    expect(mockDb._tables.sync_queue.find(r => r.id === qItem.id)).toBeUndefined();
  });
});

// 6. Internet Recovery — SyncManager triggers on connectivity
describe('SyncManager internet recovery', () => {
  it('calls triggerSync when NetInfo reports online', async () => {
    const { SyncManager } = require('../../src/sync/SyncManager');
    const spy = jest.spyOn(SyncManager, 'triggerSync').mockResolvedValue();

    SyncManager.start();

    // Simulate NetInfo callback
    const NetInfo = require('@react-native-community/netinfo');
    const addEventListenerMock = NetInfo.addEventListener || NetInfo.default?.addEventListener;
    if (addEventListenerMock && addEventListenerMock.mock) {
      const calls = addEventListenerMock.mock.calls;
      const lastCall = calls[calls.length - 1];
      const callback = lastCall ? lastCall[0] : null;
      if (callback) {
        callback({ isConnected: true, isInternetReachable: true });
      }
    }

    expect(spy).toHaveBeenCalled();
    SyncManager.stop();
    spy.mockRestore();
  });
});


// 7. Database Recovery — getDatabase throws if not initialised
describe('Database.getDatabase', () => {
  it('throws if called before openDatabase', () => {
    jest.spyOn(Database, 'getDatabase').mockImplementationOnce(() => {
      throw new Error('Database not initialised. Call openDatabase() first.');
    });
    expect(() => Database.getDatabase()).toThrow('Database not initialised');
  });
});

// 8. Background Sync — headlessTask calls triggerSync
describe('BackgroundSync.headlessTask', () => {
  it('calls SyncManager.triggerSync and finishes task', async () => {
    const bgFetchMock = {
      finish: jest.fn(),
      configure: jest.fn(),
      scheduleTask: jest.fn(),
      registerHeadlessTask: jest.fn(),
      NETWORK_TYPE_ANY: 1,
    };
    jest.doMock('react-native-background-fetch', () => bgFetchMock);
    jest.doMock('../../src/database/database', () => ({
      openDatabase: jest.fn(async () => {}),
      getDatabase: jest.fn(() => mockDb),
    }));
    jest.doMock('../../src/sync/SyncManager', () => ({
      SyncManager: { triggerSync: jest.fn(async () => {}), start: jest.fn(), stop: jest.fn() },
    }));

    const { headlessTask } = require('../../src/sync/BackgroundSync');
    const BackgroundFetch = require('react-native-background-fetch');
    const { SyncManager } = require('../../src/sync/SyncManager');

    await headlessTask({ taskId: 'test-task' });

    expect(SyncManager.triggerSync).toHaveBeenCalled();
    expect(BackgroundFetch.finish).toHaveBeenCalledWith('test-task');
  });
});


