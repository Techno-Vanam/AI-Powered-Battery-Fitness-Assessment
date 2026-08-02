import db from '../database/connection.js';

// POST /tests/sit-and-reach
export const createTest = async (req, res) => {
  const { athleteId, trials, notes, sessionDate, idempotencyKey } = req.body;
  const testerId = req.user ? req.user.id : 1;

  try {
    if (idempotencyKey) {
      const [existing] = await db.query(
        'SELECT * FROM sit_and_reach_tests WHERE idempotency_key = ?',
        [idempotencyKey]
      );
      if (existing.length) return res.status(200).json(existing[0]); // already saved, don't duplicate
    }

    if (!Array.isArray(trials) || trials.length !== 3) {
      return res.status(400).json({ error: 'Exactly 3 trial values required' });
    }
    if (trials.some(t => typeof t !== 'number' || t < -50 || t > 100)) {
      return res.status(400).json({ error: 'Trial value out of range (-50 to 100 cm)' });
    }

    const score = Math.max(...trials);

    const [result] = await db.query(
      `INSERT INTO sit_and_reach_tests
       (athlete_id, tester_id, session_date, trial_1, trial_2, trial_3, score, notes, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [athleteId, testerId, sessionDate || new Date().toISOString().slice(0, 10), trials[0], trials[1], trials[2], score, notes || null, idempotencyKey || null]
    );

    const [rows] = await db.query('SELECT * FROM sit_and_reach_tests WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /tests/sit-and-reach/athlete/:athleteId
export const getAthleteHistory = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM sit_and_reach_tests
       WHERE athlete_id = ? AND is_superseded = FALSE
       ORDER BY created_at DESC`,
      [req.params.athleteId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /tests/sit-and-reach/:id
export const getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sit_and_reach_tests WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /tests/sit-and-reach/:id/correct
export const correctTest = async (req, res) => {
  const { trials, notes, idempotencyKey } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Idempotency check — a retried correction must not supersede the same row twice
    if (idempotencyKey) {
      const [existing] = await conn.query(
        'SELECT * FROM sit_and_reach_tests WHERE idempotency_key = ?',
        [idempotencyKey]
      );
      if (existing.length) {
        await conn.rollback();
        return res.status(200).json(existing[0]);
      }
    }

    const [oldRows] = await conn.query('SELECT * FROM sit_and_reach_tests WHERE id = ?', [req.params.id]);
    if (!oldRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Original test not found' });
    }
    const oldTest = oldRows[0];

    if (oldTest.is_superseded) {
      await conn.rollback();
      return res.status(409).json({ error: 'This test has already been corrected', supersededBy: oldTest.superseded_by });
    }

    if (!Array.isArray(trials) || trials.length !== 3) {
      await conn.rollback();
      return res.status(400).json({ error: 'Exactly 3 trial values required' });
    }
    if (trials.some(t => typeof t !== 'number' || t < -50 || t > 100)) {
      await conn.rollback();
      return res.status(400).json({ error: 'Trial value out of range (-50 to 100 cm)' });
    }

    const score = Math.max(...trials);
    const testerId = req.user ? req.user.id : 1;

    const [insertResult] = await conn.query(
      `INSERT INTO sit_and_reach_tests
       (athlete_id, tester_id, session_date, trial_1, trial_2, trial_3, score, notes, correction_of, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [oldTest.athlete_id, testerId, oldTest.session_date, trials[0], trials[1], trials[2], score, notes || null, oldTest.id, idempotencyKey || null]
    );

    // Targeted update — only these two columns ever change on an existing row
    await conn.query(
      'UPDATE sit_and_reach_tests SET is_superseded = TRUE, superseded_by = ? WHERE id = ?',
      [insertResult.insertId, oldTest.id]
    );

    await conn.commit();

    const [newRows] = await db.query('SELECT * FROM sit_and_reach_tests WHERE id = ?', [insertResult.insertId]);
    res.status(201).json(newRows[0]);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// GET /tests/sit-and-reach/session/:sessionDate
export const getBySessionDate = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT srt.*, a.name AS athlete_name
       FROM sit_and_reach_tests srt
       JOIN athletes a ON a.id = srt.athlete_id
       WHERE srt.session_date = ? AND srt.is_superseded = FALSE`,
      [req.params.sessionDate]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createTest,
  getAthleteHistory,
  getById,
  correctTest,
  getBySessionDate
};
