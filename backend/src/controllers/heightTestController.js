import * as heightTestService from '../services/heightTestService.js';
import { HTTP } from '../config/constants.js';

export async function uploadHeightTest(req, res, next) {
  try {
    const result = await heightTestService.uploadHeightTest(req.body);
    const status = result.idempotent ? HTTP.OK : HTTP.CREATED;
    return res.status(status).json(result);
  } catch (err) {
    next(err);
  }
}

export async function headHeightTest(req, res, next) {
  try {
    const exists = await heightTestService.heightTestExists(req.params.measurementId);
    return res.status(exists ? HTTP.OK : HTTP.NOT_FOUND).end();
  } catch (err) {
    next(err);
  }
}

export async function getHeightTest(req, res, next) {
  try {
    const row = await heightTestService.getHeightTest(req.params.measurementId);
    if (!row) return res.status(HTTP.NOT_FOUND).json({ message: 'Height test not found' });
    return res.json(row);
  } catch (err) {
    next(err);
  }
}
