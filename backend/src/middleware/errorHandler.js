import env from '../config/env.js';
import { HTTP } from '../config/constants.js';

/**
 * Global Express error handler.
 * Must be registered last — after all routes.
 *
 * Handles:
 *   - Application errors with a statusCode property
 *   - SQLite constraint violations (UNIQUE, CHECK, FK)
 *   - Unexpected errors (returns 500, never leaks internals in production)
 *
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Determine status code
  let status  = err.statusCode ?? HTTP.INTERNAL;
  let message = err.message    ?? 'An unexpected error occurred.';

  // ── SQLite constraint errors ───────────────────────────────────────────────
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    status  = HTTP.CONFLICT;
    message = 'A record with this identifier already exists.';
  } else if (err.code === 'SQLITE_CONSTRAINT_CHECK') {
    status  = HTTP.UNPROCESSABLE;
    message = 'The submitted data violates a database constraint.';
  } else if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    status  = HTTP.UNPROCESSABLE;
    message = 'Referenced record does not exist.';
  }

  // ── Sanitise 500s in production ────────────────────────────────────────────
  if (status === HTTP.INTERNAL && env.IS_PRODUCTION) {
    message = 'An internal server error occurred.';
  }

  // Always log unexpected 500s regardless of environment
  if (status === HTTP.INTERNAL) {
    console.error('[Error]', err);
  }

  res.status(status).json({ success: false, message });
}
