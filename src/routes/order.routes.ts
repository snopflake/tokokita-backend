// src/routes/order.routes.ts
import { Router } from 'express';
import { createOrder } from '../services/order.service';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/checkout
router.post('/checkout', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { items, totalAmount, address, phone } = req.body;

    if (!items || !totalAmount || !address || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { order, payment } = await createOrder(userId, {
      items,
      totalAmount,
      address,
      phone
    });

    res.status(201).json({
      orderId: order._id,
      paymentStatus: payment.status,
      paymentTransactionId: payment.transactionId
    });
  } catch (err) {
    next(err);
  }
});

export default router;
