import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { fetchApi } from '../config/api';
import { MOCK_ATHLETE_DASHBOARD } from '../data/mockAthleteDashboard';
import type { AthleteDashboardData } from '../types/athleteDashboard';

const CACHE_KEY = '@athlete_dashboard_cache_v3';
const FETCH_TIMEOUT_MS = 2500;

const ALLOWED_TEST_IDS = new Set(['height', 'weight', 'sit_reach', 'vertical_jump', 'sit_ups']);
const ALLOWED_PERFORMANCE_KEYS = new Set(['height', 'weight', 'bmi', 'flexibility', 'vertical_jump', 'sit_ups']);

export function sanitizeDashboardData(raw: AthleteDashboardData): AthleteDashboardData {
  if (!raw) return MOCK_ATHLETE_DASHBOARD;

  const tests = (raw.tests || []).filter(
    t => ALLOWED_TEST_IDS.has(t.id) || ALLOWED_TEST_IDS.has(t.key)
  );
  const performance = (raw.performance || []).filter(p => ALLOWED_PERFORMANCE_KEYS.has(p.key));
  const completedCount = tests.filter(t => t.status === 'completed').length;
  const totalCount = tests.length || 5;

  const currentTest =
    raw.currentTest && ALLOWED_TEST_IDS.has(raw.currentTest.testId)
      ? raw.currentTest
      : {
          testId: 'sit_ups',
          name: 'Sit-Ups',
          status: 'in_progress' as const,
          attemptsRemaining: 1,
          estimatedMinutes: 3,
        };

  return {
    ...raw,
    greeting: {
      ...raw.greeting,
      completedTests: completedCount,
      totalTests: totalCount,
      statusLabel: `${completedCount}/${totalCount} Tests Completed`,
    },
    progress: {
      completed: completedCount,
      remaining: Math.max(0, totalCount - completedCount),
      percent: Math.round((completedCount / (totalCount || 1)) * 100),
    },
    currentTest,
    tests,
    performance,
  };
}

export type DashboardLoadResult = {
  data: AthleteDashboardData;
  fromCache: boolean;
  isOnline: boolean;
};

async function readCache(): Promise<AthleteDashboardData | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AthleteDashboardData;
  } catch {
    return null;
  }
}

async function writeCache(data: AthleteDashboardData): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore cache write failures
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), ms);
    }),
  ]);
}

async function isDeviceOnline(): Promise<boolean> {
  try {
    const net = await withTimeout(NetInfo.fetch(), 1500);
    return Boolean(net.isConnected && net.isInternetReachable !== false);
  } catch {
    return true;
  }
}

/**
 * Fetches GET /api/athlete/dashboard.
 * Falls back to mock data when the route is unavailable (dev),
 * and to AsyncStorage cache when offline.
 * Uses a short timeout so the UI never stays stuck on loading.
 */
export async function fetchAthleteDashboard(): Promise<DashboardLoadResult> {
  const isOnline = await isDeviceOnline();

  if (!isOnline) {
    const cached = await readCache();
    const cleanData = sanitizeDashboardData(cached ?? MOCK_ATHLETE_DASHBOARD);
    return {
      data: cleanData,
      fromCache: true,
      isOnline: false,
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetchApi('/athlete/dashboard', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (response.ok) {
      const body = (await response.json()) as {
        success?: boolean;
        data?: AthleteDashboardData;
      };
      const rawData = body.data ?? (body as unknown as AthleteDashboardData);
      if (rawData?.profile && rawData?.tests) {
        const cleanData = sanitizeDashboardData(rawData);
        await writeCache(cleanData);
        return { data: cleanData, fromCache: false, isOnline: true };
      }
    }
  } catch {
    // API not ready / timeout — use cache or mock
  }

  const cached = await readCache();
  if (cached) {
    const cleanData = sanitizeDashboardData(cached);
    return { data: cleanData, fromCache: true, isOnline: true };
  }

  const cleanMock = sanitizeDashboardData(MOCK_ATHLETE_DASHBOARD);
  await writeCache(cleanMock);
  return { data: cleanMock, fromCache: false, isOnline: true };
}

export async function syncAthleteDashboardNow(): Promise<DashboardLoadResult> {
  return fetchAthleteDashboard();
}
