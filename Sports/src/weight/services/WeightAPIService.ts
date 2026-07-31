import axios, { AxiosInstance } from 'axios';
import { WEIGHT_CONFIG } from '../constants';
import { WeightMeasurement } from '../types';

class WeightAPIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: WEIGHT_CONFIG.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Upload single measurement to backend
   * POST /api/weight-measurements
   */
  async uploadMeasurement(measurement: WeightMeasurement): Promise<any> {
    try {
      const payload = {
        id: measurement.id,
        weight: measurement.weight,
        ocr_confidence: measurement.ocrConfidence,
        captured_at: measurement.timestamp
      };

      const response = await this.client.post('/weight-measurements', payload);
      return response.data;
    } catch (error: any) {
      console.error('[WeightAPIService] Upload error:', error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Bulk upload pending offline measurements
   * POST /api/weight-measurements/sync
   */
  async syncMeasurements(measurements: WeightMeasurement[]): Promise<any> {
    try {
      const payload = {
        measurements: measurements.map(m => ({
          id: m.id,
          weight: m.weight,
          ocr_confidence: m.ocrConfidence,
          captured_at: m.timestamp
        }))
      };

      const response = await this.client.post('/weight-measurements/sync', payload);
      return response.data;
    } catch (error: any) {
      console.error('[WeightAPIService] Bulk sync error:', error?.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fetch all measurements from backend
   * GET /api/weight-measurements
   */
  async fetchMeasurements(): Promise<any> {
    try {
      const response = await this.client.get('/weight-measurements');
      return response.data;
    } catch (error: any) {
      console.error('[WeightAPIService] Fetch error:', error?.response?.data || error.message);
      throw error;
    }
  }
}

export default new WeightAPIService();
