// src/types/clickstream.ts

// Jenis aksi yang bisa terjadi di UI
export type ClickAction = 'view' | 'click' | 'add_to_cart' | 'purchase';

export interface ClickstreamPayload {
  // ID sesi anonym (mis: diset di frontend pakai localStorage/cookie)
  sessionId: string;

  // Produk yang diinteraksi
  productId: string;

  // Jenis aksi
  action: ClickAction;

  // ISO string dari frontend atau backend
  timestamp?: string;

  // Diisi kalau user login (opsional)
  userId?: string;

  // Metadata tambahan, mis: userAgent, ip, page, dsb.
  metadata?: Record<string, unknown>;
}
