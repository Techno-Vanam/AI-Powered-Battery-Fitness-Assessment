const DatabaseService = require('./DatabaseService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('crypto');

// In-memory fallback database for when MySQL is unreachable
const memoryStore = new Map();

class WeightRepository {
  /**
   * Insert a weight measurement record into MySQL (or fallback memory store)
   */
  async create({ id, weight, ocr_confidence, captured_at }) {
    const recordId = id || (uuidv4 ? uuidv4() : `wm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const formattedCapturedAt = new Date(captured_at).toISOString().slice(0, 19).replace('T', ' ');

    try {
      const sql = `
        INSERT INTO weight_measurements (id, weight, ocr_confidence, captured_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      await DatabaseService.query(sql, [recordId, weight, ocr_confidence, formattedCapturedAt]);
      logger.info(`Inserted weight measurement into MySQL: ${recordId}`);
    } catch (error) {
      logger.warn(`MySQL write failed (${error.message}). Saving to in-memory fallback store.`);
      memoryStore.set(recordId, {
        id: recordId,
        weight: parseFloat(weight),
        ocr_confidence: parseFloat(ocr_confidence),
        captured_at: formattedCapturedAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return this.findById(recordId);
  }

  /**
   * Find measurement by ID
   */
  async findById(id) {
    try {
      const sql = `SELECT * FROM weight_measurements WHERE id = ?`;
      const { rows } = await DatabaseService.query(sql, [id]);
      if (rows && rows.length > 0) {
        return rows[0];
      }
    } catch (error) {
      logger.warn(`MySQL findById failed. Checking fallback store for ID: ${id}`);
    }
    return memoryStore.get(id) || null;
  }

  /**
   * Fetch all weight measurements with optional pagination
   */
  async findAll({ limit = 50, offset = 0 } = {}) {
    try {
      const sql = `SELECT * FROM weight_measurements ORDER BY captured_at DESC LIMIT ? OFFSET ?`;
      const { rows } = await DatabaseService.query(sql, [limit, offset]);
      if (rows && rows.length >= 0) {
        return rows;
      }
    } catch (error) {
      logger.warn('MySQL findAll failed. Fetching from in-memory fallback store.');
    }
    const all = Array.from(memoryStore.values());
    all.sort((a, b) => new Date(b.captured_at) - new Date(a.captured_at));
    return all.slice(offset, offset + limit);
  }

  /**
   * Bulk insert multiple measurements
   */
  async createBulk(measurements) {
    const createdRecords = [];
    for (const item of measurements) {
      const created = await this.create({
        id: item.id,
        weight: item.weight,
        ocr_confidence: item.ocr_confidence || item.ocrConfidence || 0.95,
        captured_at: item.captured_at || item.capturedAt || item.timestamp || new Date().toISOString()
      });
      createdRecords.push(created);
    }
    return createdRecords;
  }

  /**
   * Delete measurement by ID
   */
  async deleteById(id) {
    let deletedCount = 0;
    try {
      const sql = `DELETE FROM weight_measurements WHERE id = ?`;
      const { rows } = await DatabaseService.query(sql, [id]);
      deletedCount = rows.affectedRows || 0;
    } catch (error) {
      logger.warn(`MySQL deleteById failed. Removing from memory store for ID: ${id}`);
    }
    if (memoryStore.has(id)) {
      memoryStore.delete(id);
      deletedCount = 1;
    }
    return deletedCount > 0;
  }
}

module.exports = new WeightRepository();
