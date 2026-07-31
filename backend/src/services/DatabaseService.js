const { getPool, testConnection } = require('../database/connection');
const logger = require('../utils/logger');

/**
 * DatabaseService wraps pool query execution and handles connection status
 */
class DatabaseService {
  static async query(sql, params = []) {
    try {
      const pool = getPool();
      const [rows, fields] = await pool.execute(sql, params);
      return { rows, fields };
    } catch (error) {
      logger.error(`Database Query Error [SQL: ${sql}]: ${error.message}`);
      throw error;
    }
  }

  static async testConnection() {
    return await testConnection();
  }
}

module.exports = DatabaseService;
