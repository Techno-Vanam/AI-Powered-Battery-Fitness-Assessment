import { fetchApi } from '../config/api';

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
      const response = await fetchApi('/weight-measurements', {
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
      const response = await fetchApi('/weight-measurements/sync', {
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

  /**
   * Fetch latest weight measurement GET /api/weight-measurements
   */
  async getLatestMeasurement(): Promise<{ weight: number; captured_at: string } | null> {
    try {
      const response = await fetchApi('/weight-measurements', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const latest = json.data[0];
        return {
          weight: Number(latest.weight),
          captured_at: latest.captured_at || latest.created_at,
        };
      }
      return null;
    } catch (err) {
      console.warn('[WeightAPIService] Error fetching latest measurement:', err);
      return null;
    }
  },
};
