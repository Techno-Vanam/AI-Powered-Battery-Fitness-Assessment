import { processQueueItem } from '../../src/sync/UploadWorker';
import type { SyncQueueItem } from '../../src/database/repositories/SyncRepository';
import { openDatabase } from '../../src/database/database';

describe('Integration Tests - Offline Storage & Cloud Sync', () => {
  beforeAll(async () => {
    await openDatabase();
  });

  test('Sync queue item execution handles missing local record gracefully', async () => {
    const queueItem: SyncQueueItem = {
      id: 'sq-test-1',
      tableName: 'height_tests',
      recordId: 'non-existent-id',
      operation: 'INSERT',
      retryCount: 0,
      createdAt: Date.now(),
    };

    const result = await processQueueItem(queueItem);
    expect(['skip', 'retry', 'success']).toContain(result);
  });

  test('Athlete upload queue item returns processed status when record not found', async () => {
    const queueItem: SyncQueueItem = {
      id: 'sq-athlete-1',
      tableName: 'athletes',
      recordId: 'missing-athlete-id',
      operation: 'INSERT',
      retryCount: 0,
      createdAt: Date.now(),
    };

    const result = await processQueueItem(queueItem);
    expect(['skip', 'retry', 'success']).toContain(result);
  });
});
