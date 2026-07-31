const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class UploadService {
  static deleteFile(filePath) {
    if (!filePath) return;
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted uploaded file: ${filePath}`);
      }
    } catch (err) {
      logger.error(`Failed to delete file ${filePath}: ${err.message}`);
    }
  }
}

module.exports = UploadService;
