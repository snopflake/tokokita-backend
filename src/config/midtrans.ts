// src/config/midtrans.ts
import midtransClient from 'midtrans-client';

const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
const clientKey = process.env.MIDTRANS_CLIENT_KEY as string;
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

if (!serverKey || !clientKey) {
  throw new Error('MIDTRANS_SERVER_KEY atau MIDTRANS_CLIENT_KEY belum di-set');
}

export const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});
