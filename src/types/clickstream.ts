// src/types/clickstream.ts

export type ClickAction = 'view' | 'click' | 'add_to_cart' | 'purchase';

export interface ClickstreamPayload {
  sessionId: string;
  productId: string;
  action: ClickAction;
  timestamp?: string; // ISO string dari frontend
  userId?: string;    // diisi kalau user login
  metadata?: Record<string, unknown>;
}
