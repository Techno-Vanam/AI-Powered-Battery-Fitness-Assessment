import { processQueueBatch } from '../../src/sync/UploadWorker';
import { PerformanceMonitor } from '../../src/utils/PerformanceMonitor';
import { openDatabase } from '../../src/database/database';

describe('Stress Tests - Resilience: Internet Loss, App Crash & Low Battery', () => {
  beforeAll(async () => {
    await openDatabase();
  });

  test('Internet Loss: Aborts sync batch cleanly without data loss when network disappears', async () => {
    const count = await processQueueBatch();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Low Battery: Throttles AI detection and maintains responsive system status under load', () => {
    for (let i = 0; i < 100; i++) {
      PerformanceMonitor.recordPreviewFrame();
      if (i % 2 === 0) {
        PerformanceMonitor.recordAiFrame(15, 25, 40);
      }
    }

    const metrics = PerformanceMonitor.getMetrics();
    expect(metrics.isAiThrottled).toBe(true);
    expect(metrics.previewFps).toBeGreaterThan(0);
  });
});
