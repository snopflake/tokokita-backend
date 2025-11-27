// src/routes/product.routes.ts
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/products
 * Bisa pakai query:
 *   - ?search=keyword
 */
router.get('/', ProductController.getProducts);

/**
 * GET /api/products/recommendations
 * (HARUS di atas '/:id')
 */
router.get(
  '/recommendations',
  authMiddleware,
  ProductController.getRecommendedProducts
);

/**
 * GET /api/products/:id
 */
router.get('/:id', ProductController.getProductById);

export default router;
