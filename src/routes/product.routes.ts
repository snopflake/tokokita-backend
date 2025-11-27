// src/routes/product.routes.ts
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
// import { authMiddleware } from '../middlewares/auth.middleware'; // kalau mau proteksi

const router = Router();

/**
 * GET /api/products
 * Bisa pakai query:
 *   - ?search=keyword
 */
router.get('/', ProductController.getProducts);

/**
 * GET /api/products/:id
 */
router.get('/:id', ProductController.getProductById);

export default router;
