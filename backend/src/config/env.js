const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fitness_weight_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10)
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads/',
    maxFileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)) * 1024 * 1024
  }
};
