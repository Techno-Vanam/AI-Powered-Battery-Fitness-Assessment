import NetInfo from '@react-native-community/netinfo';
import { v4 as uuidv4 } from 'uuid';
import { apiClient } from '../api/client';
import {
  queueCreate, queueCorrection, getPending,
  markSyncing, markFailed, removeFromQueue
} from '../db/sitAndReachRepository';

export interface SitAndReachTrials { trials: [number, number, number]; }

const isOnline = async (): Promise<boolean> => {
  const net = await NetInfo.fetch();
  return !!(net.isConnected && net.isInternetReachable);
};

export const submitTest = async (params: {
  athleteId: number;
  trials: [number, number, number];
  notes?: string;
  sessionDate: string;
}) => {
  const localId = uuidv4();

  const online = await isOnline();
  if (online) {
    try {
      const { data } = await apiClient.post('/tests/sit-and-reach', {
        athleteId: params.athleteId,
        trials: params.trials,
        notes: params.notes,
        sessionDate: params.sessionDate,
        idempotencyKey: localId
      });
      return { status: 'synced' as const, data };
    } catch {
      // Server unreachable despite network being "up" — fall through to offline queue
    }
  }

  await queueCreate({ localId, athleteId: params.athleteId, trials: params.trials, notes: params.notes, sessionDate: params.sessionDate });
  return { status: 'queued' as const };
};

export const submitCorrection = async (params: {
  correctionOfId: number;
  athleteId: number;
  trials: [number, number, number];
  notes?: string;
  sessionDate: string;
}) => {
  const localId = uuidv4();

  const online = await isOnline();
  if (online) {
    try {
      const { data } = await apiClient.post(`/tests/sit-and-reach/${params.correctionOfId}/correct`, {
        trials: params.trials,
        notes: params.notes,
        idempotencyKey: localId
      });
      return { status: 'synced' as const, data };
    } catch {
      // fall through to offline queue
    }
  }

  await queueCorrection({
    localId, correctionOfId: params.correctionOfId, athleteId: params.athleteId,
    trials: params.trials, notes: params.notes, sessionDate: params.sessionDate
  });
  return { status: 'queued' as const };
};

export const getAthleteHistory = async (athleteId: number) => {
  const { data } = await apiClient.get(`/tests/sit-and-reach/athlete/${athleteId}`);
  return data;
};

export const syncPendingSitAndReach = async (): Promise<void> => {
  if (!(await isOnline())) return;

  const pending = await getPending();

  for (const row of pending) {
    await markSyncing(row.local_id);
    try {
      if (row.action === 'create') {
        await apiClient.post('/tests/sit-and-reach', {
          athleteId: row.athlete_id,
          trials: [row.trial_1, row.trial_2, row.trial_3],
          notes: row.notes,
          sessionDate: row.session_date,
          idempotencyKey: row.local_id
        });
      } else {
        // action === 'correct'
        await apiClient.post(`/tests/sit-and-reach/${row.correction_of_id}/correct`, {
          trials: [row.trial_1, row.trial_2, row.trial_3],
          notes: row.notes,
          idempotencyKey: row.local_id
        });
      }
      // Confirmed saved on the server — only now is it safe to delete the local temporary copy
      await removeFromQueue(row.local_id);
    } catch {
      // Still offline or server rejected it — keep it queued, retry on next sync pass
      await markFailed(row.local_id);
    }
  }
};

export const initAutoSync = (): (() => void) => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      syncPendingSitAndReach();
    }
  });
  return unsubscribe;
};
