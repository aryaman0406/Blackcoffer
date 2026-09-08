import type { CorsOptions } from 'cors';
import { env } from './env.js';

export const allowedOrigins = [
  ...env.CLIENT_URL.split(',').map((url) => url.trim()),
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server, curl, health checks)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
