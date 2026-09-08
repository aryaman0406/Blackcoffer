import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { corsOptions } from './config/index.js';
import { getHealth } from './controllers/index.js';
import { apiRateLimiter, errorHandler, requestLogger } from './middleware/index.js';
import { healthRouter, insightsRouter } from './routes/index.js';

export const createApp = (): Express => {
  const app = express();

  // Trust reverse proxy for correct client IP detection on Render
  app.set('trust proxy', 1);

  // Security Headers
  app.use(helmet());

  // CORS Middleware (configured via shared config)
  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Root Health Check for Render Deployment (GET /health)
  app.get('/health', getHealth);

  // Rate Limiting on API endpoints
  app.use('/api', apiRateLimiter);

  // API Routes
  app.use('/api', healthRouter);
  app.use('/api', insightsRouter);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
