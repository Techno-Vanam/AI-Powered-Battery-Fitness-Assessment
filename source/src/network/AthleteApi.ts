import { ApiClient } from './ApiClient';
import type { Athlete } from '../database/repositories/AthleteRepository';

export interface AthleteUploadResponse {
  id: string;
  createdAt: number;
}

export const AthleteApi = {
  async upload(athlete: Athlete): Promise<AthleteUploadResponse> {
    const { data } = await ApiClient.post<AthleteUploadResponse>('/athletes', {
      id: athlete.id,
      name: athlete.name,
      gender: athlete.gender,
      dateOfBirth: athlete.dateOfBirth,
      phone: athlete.phone,
      heightCategory: athlete.heightCategory,
      coachName: athlete.coachName,
      schoolAcademy: athlete.schoolAcademy,
      state: athlete.state,
      district: athlete.district,
      createdAt: athlete.createdAt,
      updatedAt: athlete.updatedAt,
    });
    return data;
  },

  async exists(id: string): Promise<boolean> {
    try {
      await ApiClient.head(`/athletes/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
