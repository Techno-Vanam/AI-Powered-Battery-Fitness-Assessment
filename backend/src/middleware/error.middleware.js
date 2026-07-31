const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Global Express Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  logger.error(`Unhandled Error: ${err.message}`, err.stack);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode, err.errors || null);
}

module.exports = errorHandler;
