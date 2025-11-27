// src/controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserProductStat } from '../models/UserProductStat';
import { Product } from '../models/product.model';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const products = await ProductService.getProducts(search);

      return res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id; // pakai string ObjectId

      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produk tidak ditemukan'
        });
      }

      return res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

   static async getRecommendedProducts(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.userId;
      const sessionId = req.query.sessionId as string | undefined;

      // userKey = userId kalau login, kalau belum ya pakai session
      const userKey = userId ?? (sessionId ? `session:${sessionId}` : undefined);

      let productIds: string[] = [];

      if (userKey) {
        const stats = await UserProductStat.find({ userKey })
          .sort({ score: -1, lastActionAt: -1 })
          .limit(4)
          .lean();

        productIds = stats.map((s) => s.productId.toString());
      }

      let products;

      if (productIds.length > 0) {
        const docs = await Product.find({ _id: { $in: productIds } }).lean();
        const map = new Map(docs.map((p: any) => [p._id.toString(), p]));
        products = productIds
          .map((id) => map.get(id))
          .filter((p) => p !== undefined);
      } else {
        // fallback sederhana: produk terbaru
        products = await Product.find().sort({ createdAt: -1 }).limit(4).lean();
      }

      res.json(products);
    } catch (err) {
      next(err);
    }
  }
}


