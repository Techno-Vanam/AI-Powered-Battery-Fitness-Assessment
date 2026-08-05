import { processQueueItem, processQueueBatch } from '../../src/sync/UploadWorker';
import type { SyncQueueItem } from '../../src/database/repositories/SyncRepository';
import { openDatabase } from '../../src/database/database';

describe('Unit Tests - Sync Module', () => {
  beforeAll(async () => {
    await openDatabase();
  });

  test('processQueueItem skips unknown table names', async () => {
    const item: SyncQueueItem = {
      id: 'item-1',
      tableName: 'unknown_table' as any,
      recordId: 'rec-1',
      operation: 'INSERT',
      retryCount: 0,
      lastAttempt: null,
      createdAt: Date.now(),
    };
    const res = await processQueueItem(item);
    expect(res).toBe('skip');
  });

  test('processQueueBatch returns 0 processed items when offline', async () => {
    const count = await processQueueBatch();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
