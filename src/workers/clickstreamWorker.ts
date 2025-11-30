// src/workers/clickstreamWorker.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import { UserProductStat } from '../models/UserProductStat';
import { ClickstreamPayload, ClickAction } from '../types/clickstream';

const EXCHANGE_NAME = 'clickstream.exchange';   // ⬅️ SAMA dengan di rabbitmq.service.ts
const QUEUE_NAME = 'clickstream_events';        // queue tempat worker consume

function getWeight(action: ClickAction): number {
  switch (action) {
    case 'view':
      return 1;
    case 'click':
      return 2;
    case 'add_to_cart':
      return 4;
    case 'purchase':
      return 8;
    default:
      return 1;
  }
}

async function startWorker() {
  const mongoUri = process.env.MONGO_URI!;
  const rabbitUrl = process.env.RABBITMQ_URL!;

  console.log('[Worker] Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('[Worker] MongoDB connected');

  console.log('[Worker] Connecting to RabbitMQ...');
  const conn = await amqp.connect(rabbitUrl);
  const channel = await conn.createChannel();

  // 🔹 Pastikan exchange dan queue ada
  await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  // 🔹 Bind queue ke exchange → pesan fanout akan masuk ke queue ini
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, '');

  console.log(
    `[Worker] Waiting for messages in queue "${QUEUE_NAME}" (bound to exchange "${EXCHANGE_NAME}")`
  );

  channel.consume(
    QUEUE_NAME,
    async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString()) as ClickstreamPayload;

        const userKey =
          payload.userId && payload.userId !== ''
            ? payload.userId
            : payload.sessionId
            ? `session:${payload.sessionId}`
            : null;

        if (!userKey || !payload.productId) {
          console.warn('[Worker] Missing userKey or productId, skipping');
          channel.ack(msg);
          return;
        }

        const weight = getWeight(payload.action);

        await UserProductStat.findOneAndUpdate(
          { userKey, productId: payload.productId },
          {
            $inc: { score: weight },
            $set: { lastActionAt: new Date(payload.timestamp || Date.now()) },
          },
          { upsert: true, new: true }
        );

        channel.ack(msg);
      } catch (err) {
        console.error('[Worker] Failed to process message:', err);
        channel.nack(msg, false, false); // buang pesan rusak
      }
    },
    { noAck: false }
  );
}

startWorker().catch((err) => {
  console.error('[Worker] Fatal error:', err);
  process.exit(1);
});
