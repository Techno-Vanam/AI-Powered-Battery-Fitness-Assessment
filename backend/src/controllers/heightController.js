import * as heightService from '../services/heightService.js';
import { HTTP } from '../config/constants.js';

export async function uploadAthlete(req, res, next) {
  try {
    const result = await heightService.uploadAthlete(req.body);
    return res.status(HTTP.CREATED).json(result);
  } catch (err) {
    next(err);
  }
}

export async function headAthlete(req, res, next) {
  try {
    const exists = await heightService.athleteExists(req.params.id);
    return res.status(exists ? HTTP.OK : HTTP.NOT_FOUND).end();
  } catch (err) {
    next(err);
  }
}

export async function getAthlete(req, res, next) {
  try {
    const { findAthleteById } = await import('../repositories/heightTestRepository.js');
    const row = await findAthleteById(req.params.id);
    if (!row) return res.status(HTTP.NOT_FOUND).json({ message: 'Athlete not found' });
    return res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function listAthleteHeightTests(req, res, next) {
  try {
    const { listHeightTestsByAthlete } = await import('../repositories/heightTestRepository.js');
    const rows = await listHeightTestsByAthlete(req.params.id);
    return res.json({ items: rows, count: rows.length });
  } catch (err) {
    next(err);
  }
}
