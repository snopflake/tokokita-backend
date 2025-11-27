// src/routes/order.routes.ts
import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { checkoutService } from '../services/order.service';
import { Order } from '../models/order.model';

const router = Router();

// POST /api/checkout (SUDAH ADA, ini hanya pengingat)
router.post(
  '/checkout',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;
      const { items } = req.body;

      const order = await checkoutService({
        userId,
        items,
      });

      res.status(201).json({
        message: 'Checkout berhasil (payment simulated)',
        order,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/orders → list semua order milik user login
router.get(
  '/orders',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;

      const orders = await Order.find({ userId }).sort({ createdAt: -1 });

      res.json(orders);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/orders/:id → detail 1 order milik user login
router.get(
  '/orders/:id',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;
      const orderId = req.params.id;

      const order = await Order.findOne({ _id: orderId, userId });

      if (!order) {
        return res.status(404).json({ message: 'Order tidak ditemukan' });
      }

      res.json(order);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
