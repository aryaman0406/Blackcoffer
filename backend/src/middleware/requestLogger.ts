import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/index.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const queryStr = Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '{}';

    // Only log in non-test environments or when debug enabled
    if (env.NODE_ENV !== 'test') {
      console.info(
        `[HTTP] ${req.method} ${req.path} | Query: ${queryStr} | Status: ${res.statusCode} | Duration: ${duration}ms`,
      );
    }
  });

  next();
};
