import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
