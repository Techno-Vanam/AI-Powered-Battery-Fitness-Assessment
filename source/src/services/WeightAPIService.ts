import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000/api'
  : 'http://localhost:3000/api';

export interface WeightPayload {
  id: string;
  weight: number;
  ocr_confidence: number;
  captured_at: string;
}

export const WeightAPIService = {
  /**
   * Upload single measurement to backend endpoint POST /api/weight-measurements
   */
  async uploadMeasurement(payload: WeightPayload): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/weight-measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[WeightAPIService] Upload failed (${response.status}):`, errText);
        return false;
      }

      const json = await response.json();
      return Boolean(json.success);
    } catch (err) {
      console.warn('[WeightAPIService] Network error uploading weight measurement:', err);
      return false;
    }
  },

  /**
   * Bulk upload pending measurements POST /api/weight-measurements/sync
   */
  async syncPendingMeasurements(payloads: WeightPayload[]): Promise<{
    success: boolean;
    syncedIds: string[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/weight-measurements/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloads),
      });

      if (!response.ok) {
        return { success: false, syncedIds: [] };
      }

      const json = await response.json();
      return {
        success: Boolean(json.success),
        syncedIds: json.data?.synced_ids || [],
      };
    } catch (err) {
      console.warn('[WeightAPIService] Network error bulk syncing weight measurements:', err);
      return { success: false, syncedIds: [] };
    }
  },
};
