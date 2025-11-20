import mongoose from 'mongoose';
import { config } from './env';

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[DB] MongoDB connected');
  } catch (err) {
    console.error('[DB] MongoDB connection error:', err);
    throw err;
  }
}
