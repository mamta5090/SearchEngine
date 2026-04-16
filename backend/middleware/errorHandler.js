import logger from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Global error handler middleware.
 * Must be registered LAST in Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Log full stack trace for every error
  logger.error(err);

  if (err.isApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors:  err.errors || [],
    });
  }

  // Joi validation errors surfaced from validate middleware
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors:  err.details.map(d => d.message),
    });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with the same unique key already exists.',
      errors:  [],
    });
  }

  // Fallback
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    errors:  [],
  });
};
