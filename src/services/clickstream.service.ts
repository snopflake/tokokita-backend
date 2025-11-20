// src/services/clickstream.service.ts
import { ClickstreamPayload } from '../types/clickstream';
import { publishClickEvent } from './rabbitmq.service';

export async function handleClickEvent(payload: ClickstreamPayload) {
  // Validasi sederhana
  if (!payload.sessionId) {
    throw new Error('sessionId is required');
  }
  if (!payload.productId) {
    throw new Error('productId is required');
  }
  if (!payload.action) {
    throw new Error('action is required');
  }

  // Set timestamp default kalau belum ada
  if (!payload.timestamp) {
    payload.timestamp = new Date().toISOString();
  }

  // Di sini kamu bisa tambahkan logika lain:
  // - Normalisasi action
  // - Tambah metadata (user agent, ip, dsb) kalau perlu

  // Kirim ke RabbitMQ
  await publishClickEvent(payload);
}
