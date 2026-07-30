import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';
import { HTTP } from '../config/constants.js';

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * On failure → 422 with field-level error details.
 * On success → parsed + coerced data is written back to req.body, then next().
 *
 * @param {import('zod').ZodTypeAny} schema
 * @returns {import('express').RequestHandler}
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field:   e.path.join('.'),
        message: e.message,
      }));
      return sendError(
        res,
        'Validation failed. Please check the submitted data.',
        HTTP.UNPROCESSABLE,
        errors
      );
    }

    // Replace req.body with the Zod-parsed (coerced + stripped) output
    req.body = result.data;
    next();
  };
}
