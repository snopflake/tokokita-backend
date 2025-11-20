// src/server.ts
import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';

async function start() {
  try {
    await connectDB();
    console.log('[DB] MongoDB connected');

    app.listen(config.port, () => {
      console.log(`[Server] Running on port ${config.port}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

start();
