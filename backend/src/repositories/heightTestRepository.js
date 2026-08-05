import { dbGet, dbRun, dbExecute } from '../database/db.js';

export async function findHeightTestByMeasurementId(measurementId) {
  return dbGet(
    `SELECT * FROM height_measurements WHERE measurement_id = ? LIMIT 1`,
    [measurementId],
  );
}

export async function insertHeightTest(test) {
  const syncedAt = new Date().toISOString();

  await dbRun(
    `INSERT INTO height_measurements (
       measurement_id, athlete_id, team_id, session_id, height_cm, confidence,
       device_model, timestamp, calibration_method, synced_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      test.measurementId,
      test.athleteId,
      test.teamId ?? null,
      test.sessionId ?? null,
      test.heightCm,
      test.confidence,
      test.deviceModel,
      test.timestamp,
      test.calibrationMethod,
      syncedAt,
    ],
  );

  return findHeightTestByMeasurementId(test.measurementId);
}

export async function listHeightTestsByAthlete(athleteId) {
  const result = await dbExecute(
    `SELECT * FROM height_measurements WHERE athlete_id = ? ORDER BY timestamp DESC`,
    [athleteId],
  );
  return result.rows ?? [];
}

/** Legacy athlete helpers — kept for /athletes sync routes. */
export async function findAthleteById(id) {
  return dbGet(`SELECT * FROM athletes WHERE id = ? LIMIT 1`, [id]);
}

export async function upsertAthlete(athlete) {
  const existing = await findAthleteById(athlete.id);
  const now = athlete.updatedAt ?? athlete.createdAt ?? Date.now();
  const syncedAt = new Date().toISOString();

  if (existing) {
    await dbRun(
      `UPDATE athletes SET
         name = ?, gender = ?, date_of_birth = ?, phone = ?,
         height_category = ?, coach_name = ?, school_academy = ?,
         state = ?, district = ?, updated_at = ?, synced_at = ?
       WHERE id = ?`,
      [
        athlete.name,
        athlete.gender ?? null,
        athlete.dateOfBirth ?? null,
        athlete.phone ?? null,
        athlete.heightCategory ?? null,
        athlete.coachName ?? null,
        athlete.schoolAcademy ?? null,
        athlete.state ?? null,
        athlete.district ?? null,
        now,
        syncedAt,
        athlete.id,
      ],
    );
  } else {
    await dbRun(
      `INSERT INTO athletes (
         id, name, gender, date_of_birth, phone, height_category, coach_name,
         school_academy, state, district, created_at, updated_at, synced_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        athlete.id,
        athlete.name,
        athlete.gender ?? null,
        athlete.dateOfBirth ?? null,
        athlete.phone ?? null,
        athlete.heightCategory ?? null,
        athlete.coachName ?? null,
        athlete.schoolAcademy ?? null,
        athlete.state ?? null,
        athlete.district ?? null,
        athlete.createdAt ?? now,
        now,
        syncedAt,
      ],
    );
  }

  return { id: athlete.id, createdAt: athlete.createdAt ?? now };
}
