import rateLimit from 'express-rate-limit';
import { env } from '../config/index.js';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: env.RATE_LIMIT_MAX, // Default 500 requests per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  skip: () => env.NODE_ENV === 'test', // Skip rate limiting during automated tests
});
