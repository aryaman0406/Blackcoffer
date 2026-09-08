import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: isProduction
    ? z
        .string({
          required_error: 'MONGODB_URI environment variable is required in production',
        })
        .min(1, 'MONGODB_URI cannot be empty in production')
    : z.string().default('mongodb://localhost:27017/blackcoffer_dashboard'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  RATE_LIMIT_MAX: z.coerce.number().default(500),
});

export const env = envSchema.parse(process.env);
