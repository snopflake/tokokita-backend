// src/services/payment.service.ts
import { config } from '../config/env';

interface PaymentResult {
  status: 'success' | 'failed';
  transactionId?: string;
}

export async function createPayment(
  amount: number
): Promise<PaymentResult> {
  // Di dunia nyata, di sini kamu call Midtrans menggunakan config.midtransApiKey
  // Untuk demo/security: jangan pernah log API key
  if (!config.midtransApiKey) {
    console.warn('[Payment] MIDTRANS_API_KEY is not set, simulating payment only');
  }

  // Simulasi: selalu sukses
  return {
    status: 'success',
    transactionId: 'SIMULATED-' + Date.now()
  };
}
