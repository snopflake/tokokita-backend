// src/routes/clickstream.routes.ts
import { Router } from 'express';
import { handleClickEvent } from '../services/clickstream.service';
import { AuthRequest } from '../middleware/authMiddleware';
import { ClickstreamPayload } from '../types/clickstream';

const router = Router();

// POST /api/clickstream
router.post('/clickstream', async (req: AuthRequest, res, next) => {
  try {
    const { sessionId, productId, action, timestamp, metadata } = req.body as Partial<ClickstreamPayload>;

    const userId = req.user?.userId; // akan terisi kalau kamu pakai authMiddleware di masa depan

    const payload: ClickstreamPayload = {
      sessionId: sessionId || '',
      productId: productId || '',
      action: action as ClickstreamPayload['action'],
      timestamp,
      userId,
      metadata
    };

    await handleClickEvent(payload);

    // 202 = accepted (diterima untuk diproses async)
    res.status(202).json({ message: 'Clickstream event accepted' });
  } catch (err) {
    next(err);
  }
});

export default router;
