import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

/**
 * 100 requests per minute per user (keyed on user_id when available, else IP).
 * Must be used AFTER the authenticate middleware so req.user is populated.
 */
export const userRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max:      100,
  // keyGenerator: (req) => {
  //   // Per authenticated user, fallback to IP
  //   return req.user ? `user_${req.user.id}` : req.ip;
  // },
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests. Limit: 100 per minute.'));
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

/**
 *  Stricter limiter for auth routes  (prevent brute-force)
 * 20 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many authentication attempts. Please try again later.'));
  },
  standardHeaders: true,
  legacyHeaders:   false,
});
