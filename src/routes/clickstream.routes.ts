// src/routes/clickstream.routes.ts
import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { handleClickEvent } from '../services/clickstream.service';

const router = Router();

// kalau mau clickstream hanya untuk user login → pakai authMiddleware
router.post(
  '/clickstream',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const { sessionId, productId, action, metadata } = req.body;

      if (!sessionId || !productId || !action) {
        return res.status(400).json({ message: 'sessionId, productId, action required' });
      }

      await handleClickEvent({
        sessionId,
        productId,
        action,
        metadata,
        // ⬇️ INI PENTING: kirim userId ke payload
        userId: req.user?.userId,
      });

      res.status(202).json({ message: 'Click event accepted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
