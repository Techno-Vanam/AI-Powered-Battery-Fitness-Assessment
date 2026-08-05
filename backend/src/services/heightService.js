import * as repo from '../repositories/heightTestRepository.js';

export async function uploadAthlete(payload) {
  return repo.upsertAthlete(payload);
}

export async function athleteExists(id) {
  const row = await repo.findAthleteById(id);
  return Boolean(row);
}
