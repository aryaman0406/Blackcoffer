import mongoose from 'mongoose';
import { afterAll, beforeAll } from 'vitest';

const TEST_MONGODB_URI =
  process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/blackcoffer_test_db';

beforeAll(async () => {
  await mongoose.connect(TEST_MONGODB_URI);
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch {
      // ignore
    }
  }
  await mongoose.disconnect();
});
