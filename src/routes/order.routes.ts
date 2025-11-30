import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { checkoutService } from '../services/order.service';
import { Order, IOrder } from '../models/order.model';

const router = Router();

// POST /api/checkout
router.post(
  '/checkout',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;
      const { items, address, phone } = req.body;

      const order = await checkoutService({
        userId,
        items,
        address,
        phone,
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

      // 🔐 tambahkan field address & phone hasil dekripsi
      const result = (orders as IOrder[]).map((order) => {
        const { address, phone } = order.getContactInfo();
        const plain = order.toObject();
        return {
          ...plain,
          address,
          phone,
        };
      });

      res.json(result);
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

      const order = await Order.findOne({ _id: orderId, userId }) as IOrder | null;

      if (!order) {
        return res.status(404).json({ message: 'Order tidak ditemukan' });
      }

      const { address, phone } = order.getContactInfo();
      const plain = order.toObject();

      res.json({
        ...plain,
        address,
        phone,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
