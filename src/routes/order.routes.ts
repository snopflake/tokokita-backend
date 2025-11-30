// src/routes/order.routes.ts
import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { checkoutService } from '../services/order.service';
import { Order, IOrder } from '../models/order.model';

const router = Router();

/**
 * POST /api/checkout
 * Body:
 * {
 *   "items": [{ "productId": "...", "quantity": 2 }, ...],
 *   "address": "Jl. Contoh No. 123, Malang",
 *   "phone": "08123456789"
 * }
 */
router.post(
  '/checkout',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;
      const { items, address, phone } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items is required' });
      }
      if (!address || !phone) {
        return res
          .status(400)
          .json({ message: 'Address and phone are required' });
      }

      const order = await checkoutService({
        userId,
        items,
        address,
        phone,
      });

      // di sini order sudah punya midtransRedirectUrl (dari checkoutService)
      res.status(201).json({
        message: 'Checkout berhasil, silakan lakukan pembayaran via Midtrans',
        orderId: order._id,
        invoiceNumber: order.invoiceNumber,
        paymentStatus: order.paymentStatus, // biasanya WAITING_PAYMENT
        midtransRedirectUrl: order.midtransRedirectUrl,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/orders → list semua order milik user login
 * Mengembalikan address & phone dalam bentuk plaintext (hasil dekripsi),
 * tapi menyembunyikan field terenkripsi & status raw Midtrans.
 */
router.get(
  '/orders',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;

      const orders = await Order.find({ userId }).sort({ createdAt: -1 });

      const result = (orders as IOrder[]).map((order) => {
        const { address, phone } = order.getContactInfo();
        const plain = order.toObject();

        // sembunyikan field yang sensitif/kurang perlu di UI
        delete (plain as any).addressEnc;
        delete (plain as any).phoneEnc;
        delete (plain as any).midtransStatusRaw;

        return {
          ...plain,
          address,
          phone,
          paymentStatus: order.paymentStatus,
        };
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/orders/:id → detail 1 order milik user login
 */
router.get(
  '/orders/:id',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;
      const orderId = req.params.id;

      const order = (await Order.findOne({
        _id: orderId,
        userId,
      })) as IOrder | null;

      if (!order) {
        return res.status(404).json({ message: 'Order tidak ditemukan' });
      }

      const { address, phone } = order.getContactInfo();
      const plain = order.toObject();

      delete (plain as any).addressEnc;
      delete (plain as any).phoneEnc;
      delete (plain as any).midtransStatusRaw;

      res.json({
        ...plain,
        address,
        phone,
        paymentStatus: order.paymentStatus, // PENDING / WAITING_PAYMENT / PAID / FAILED / PAID_SIMULATED
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
