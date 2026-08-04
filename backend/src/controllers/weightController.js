import {
  createWeightMeasurement,
  getWeightMeasurementById,
  getAllWeightMeasurements,
  syncWeightMeasurements,
} from '../services/weightService.js';

export async function uploadMeasurement(req, res, next) {
  try {
    const data = req.body;
    const result = await createWeightMeasurement(data);
    return res.status(201).json({
      success: true,
      message: 'Weight measurement saved successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function fetchMeasurements(_req, res, next) {
  try {
    const list = await getAllWeightMeasurements();
    return res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (err) {
    next(err);
  }
}

export async function fetchMeasurementById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await getWeightMeasurementById(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function syncMeasurements(req, res, next) {
  try {
    const records = Array.isArray(req.body) ? req.body : req.body.measurements || [];
    const result = await syncWeightMeasurements(records);
    return res.status(200).json({
      success: true,
      message: `${result.synced_count} measurements synchronized successfully.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
