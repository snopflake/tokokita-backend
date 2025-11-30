// src/services/recommendation.service.ts
import { UserProductStat } from '../models/UserProductStat';
import { Product } from '../models/product.model';

export async function getRecommendationsForUser(userId: string, limit = 8) {
  const userKey = userId; // worker pakai userId langsung utk user login

  // Ambil statistik produk dengan score tertinggi untuk user ini
  const stats = await UserProductStat.find({ userKey })
    .sort({ score: -1, lastActionAt: -1 })
    .limit(limit);

  if (stats.length === 0) {
    return [];
  }

  const productIds = stats.map((s) => s.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  // urutkan produk sesuai urutan skor
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const sortedProducts = stats
    .map((s) => productMap.get(s.productId.toString()))
    .filter(Boolean);

  return sortedProducts;
}
