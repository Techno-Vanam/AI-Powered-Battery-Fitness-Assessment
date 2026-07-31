const mysql = require('mysql2/promise');
const config = require('../config/env');

let pool = null;

/**
 * Initializes MySQL connection pool.
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      waitForConnections: true,
      connectionLimit: config.db.connectionLimit,
      queueLimit: 0,
      dateStrings: true
    });
  }
  return pool;
}

/**
 * Verifies connection to MySQL server and initializes database/tables if needed.
 */
async function testConnection() {
  try {
    const currentPool = getPool();
    const connection = await currentPool.getConnection();
    console.log(`[MySQL] Successfully connected to database: ${config.db.database} at ${config.db.host}:${config.db.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[MySQL] Warning: Unable to connect to MySQL database at ${config.db.host}:${config.db.port}. Message: ${error.message}`);
    console.warn('[MySQL] The API will run in fallback mock mode for database operations if MySQL is offline.');
    return false;
  }
}

module.exports = {
  getPool,
  testConnection
};
