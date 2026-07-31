import { PerformanceMonitor } from '../../src/utils/PerformanceMonitor';

describe('Integration Tests - Camera & Frame Processor', () => {
  beforeEach(() => {
    PerformanceMonitor.stopMonitoring();
  });

  test('PerformanceMonitor records preview frames and throttles AI frames to target 20 FPS', () => {
    for (let i = 0; i < 30; i++) {
      PerformanceMonitor.recordPreviewFrame();
    }
    for (let i = 0; i < 20; i++) {
      PerformanceMonitor.recordAiFrame(10, 18, 28);
    }

    const metrics = PerformanceMonitor.getMetrics();
    expect(metrics.isAiThrottled).toBe(true);
    expect(metrics.arucoLatencyMs).toBe(10);
    expect(metrics.poseLatencyMs).toBe(18);
    expect(metrics.totalPipelineLatencyMs).toBe(28);
    expect(metrics.status).toBe('OPTIMAL');
  });

  test('PerformanceMonitor emits updates to subscribers', (done) => {
    let unsub: () => void;
    unsub = PerformanceMonitor.subscribe(metrics => {
      expect(metrics).toBeDefined();
      expect(metrics.memoryUsageMb).toBeGreaterThan(0);
      if (unsub) unsub();
      done();
    });
  });
});
