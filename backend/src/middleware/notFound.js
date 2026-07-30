import { HTTP } from '../config/constants.js';

/**
 * 404 catch-all middleware.
 * Must be registered after all routes but before the error handler.
 *
 * @type {import('express').RequestHandler}
 */
export function notFound(req, res) {
  res.status(HTTP.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}
