// src/routes/midtrans.routes.ts
import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { Order } from '../models/order.model';

const router = Router();

// Midtrans akan POST ke sini
router.post('/midtrans/callback', async (req: Request, res: Response) => {
  try {
    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = req.body;

    // 🔐 Verifikasi signature dari Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY as string;
    const rawSig = order_id + status_code + gross_amount + serverKey;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(rawSig)
      .digest('hex');

    if (expectedSignature !== signature_key) {
      console.error('Invalid Midtrans signature');
      return res.status(403).send('Invalid signature');
    }

    // 🔎 Cari Order berdasarkan invoiceNumber (order_id kita)
    const order = await Order.findOne({ invoiceNumber: order_id });
    if (!order) {
      console.error('Order not found for order_id', order_id);
      return res.status(404).send('Order not found');
    }

    // 💳 Logika update status
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      // pembayaran sukses
      order.paymentStatus = 'PAID';
      // di sini kamu boleh sekalian Kurangi stok atau trigger proses pengiriman
      // (kalau stok belum dikurangi di checkout)
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire'
    ) {
      order.paymentStatus = 'FAILED';
    } else if (transaction_status === 'pending') {
      order.paymentStatus = 'WAITING_PAYMENT';
    }

    // simpan raw notifikasi untuk audit
    order.midtransStatusRaw = req.body;
    await order.save();

    // penting: selalu balas 200 OK ke Midtrans
    return res.status(200).send('OK');
  } catch (err) {
    console.error('Midtrans callback error', err);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
