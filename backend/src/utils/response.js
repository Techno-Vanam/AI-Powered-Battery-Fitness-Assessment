import { HTTP } from '../config/constants.js';

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {any}    data
 * @param {number} status  HTTP status code (default 200)
 */
export function sendSuccess(res, message, data = null, status = HTTP.OK) {
  const body = { success: true, message };
  if (data !== null && data !== undefined) {
    body.data = data;
  }
  return res.status(status).json(body);
}

/**
 * Send a created (201) response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {any}    data
 */
export function sendCreated(res, message, data = null) {
  return sendSuccess(res, message, data, HTTP.CREATED);
}

/**
 * Send an error response.  Never exposes stack traces.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} status  HTTP status code (default 400)
 * @param {any}    [errors]  optional field-level error details
 */
export function sendError(res, message, status = HTTP.BAD_REQUEST, errors = undefined) {
  const body = { success: false, message };
  if (errors !== undefined) {
    body.errors = errors;
  }
  return res.status(status).json(body);
}
