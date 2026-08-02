/**
 * Jump Assessment History Local Repository (Offline Storage)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { JumpAttempt } from '../types/jump';

const JUMP_HISTORY_STORAGE_KEY = '@jump_assessment_history_v1';

export class JumpHistoryRepository {
  public async getHistory(): Promise<JumpAttempt[]> {
    try {
      const json = await AsyncStorage.getItem(JUMP_HISTORY_STORAGE_KEY);
      if (!json) return [];
      return JSON.parse(json) as JumpAttempt[];
    } catch {
      return [];
    }
  }

  public async saveAttempt(attempt: JumpAttempt): Promise<void> {
    try {
      const current = await this.getHistory();
      const updated = [attempt, ...current];
      await AsyncStorage.setItem(JUMP_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save jump attempt locally:', e);
    }
  }

  public async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(JUMP_HISTORY_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear jump history:', e);
    }
  }
}

export const jumpHistoryRepo = new JumpHistoryRepository();
