import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { fetchApi } from '../config/api';
import { MOCK_ATHLETE_DASHBOARD } from '../data/mockAthleteDashboard';
import type { AthleteDashboardData } from '../types/athleteDashboard';

const CACHE_KEY = '@athlete_dashboard_cache_v1';
const FETCH_TIMEOUT_MS = 2500;

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
    return {
      data: cached ?? MOCK_ATHLETE_DASHBOARD,
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
      const data = body.data ?? (body as unknown as AthleteDashboardData);
      if (data?.profile && data?.tests) {
        await writeCache(data);
        return { data, fromCache: false, isOnline: true };
      }
    }
  } catch {
    // API not ready / timeout — use cache or mock
  }

  const cached = await readCache();
  if (cached) {
    return { data: cached, fromCache: true, isOnline: true };
  }

  await writeCache(MOCK_ATHLETE_DASHBOARD);
  return { data: MOCK_ATHLETE_DASHBOARD, fromCache: false, isOnline: true };
}

export async function syncAthleteDashboardNow(): Promise<DashboardLoadResult> {
  return fetchAthleteDashboard();
}
