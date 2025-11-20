// src/server.ts
import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
import { initRabbitMQ } from './services/rabbitmq.service'; // ⬅️ tambahin ini

async function start() {
  try {
    // 1. Konek ke MongoDB
    await connectDB();
    console.log('[DB] MongoDB connected');

    // 2. Inisialisasi RabbitMQ
    await initRabbitMQ(); // ⬅️ panggil ini

    // 3. Start HTTP server
    app.listen(config.port, () => {
      console.log(`[Server] Running on port ${config.port}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

start();
