// src/services/rabbitmq.service.ts
import * as amqplib from 'amqplib';
import { config } from '../config/env';
import { ClickstreamPayload } from '../types/clickstream';

// PAKAI ANY — SOLUSI AMAN UNTUK TYPING AMQPLIB YANG TIDAK KONSISTEN
let connection: any = null;
let channel: any = null;

const EXCHANGE_NAME = 'clickstream.exchange';
const ROUTING_KEY = 'clickstream.event';

// Dipanggil sekali saat server start
export async function initRabbitMQ() {
  if (!config.rabbitUrl) {
    console.warn('[RabbitMQ] No RABBITMQ_URL provided. RabbitMQ disabled.');
    return;
  }

  try {
    console.log('[RabbitMQ] Connecting to:', config.rabbitUrl);

    // 1. Connect → support amqp:// dan amqps://
    const conn = await amqplib.connect(config.rabbitUrl);
    connection = conn;

    (conn as any).on('error', (err: any) => {
      console.error('[RabbitMQ] Connection error:', err?.message || err);
    });

    (conn as any).on('close', () => {
      console.warn('[RabbitMQ] Connection closed');
    });

    // 2. Create Channel
    const ch = await conn.createChannel();
    channel = ch;

    // 3. Assert Exchange (fanout)
    await ch.assertExchange(EXCHANGE_NAME, 'fanout', {
      durable: true,
    });

    console.log('[RabbitMQ] Connected & Exchange ready');
  } catch (err: any) {
    console.error('[RabbitMQ] Failed to initialize:', err?.message || err);
    connection = null;
    channel = null;
  }
}

// Untuk publish event clickstream
export async function publishClickEvent(payload: ClickstreamPayload) {
  if (!channel) {
    console.warn('[RabbitMQ] Channel not initialized. Event skipped.');
    return;
  }

  try {
    const message = Buffer.from(JSON.stringify(payload));
    channel.publish(EXCHANGE_NAME, ROUTING_KEY, message, {
      contentType: 'application/json',
      persistent: true,
    });
  } catch (err: any) {
    console.error('[RabbitMQ] Failed to publish event:', err?.message || err);
  }
}
