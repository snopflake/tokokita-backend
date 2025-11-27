// src/services/product.service.ts
import { Product, IProduct } from '../models/product.model';

export class ProductService {
  static async getProducts(search?: string): Promise<IProduct[]> {
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    return Product.find(filter).exec();
  }

  static async getProductById(id: string): Promise<IProduct | null> {
    // id di sini adalah ObjectId string dari MongoDB
    return Product.findById(id).exec();
  }
}
