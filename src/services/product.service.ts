// src/services/product.service.ts
import { Product } from '../models/product.model';

export class ProductService {
  /**
   * Ambil list produk.
   * Bisa pakai query "search" untuk filter nama/desc.
   */
  static async getProducts(search?: string): Promise<Product[]> {
    // TODO: ganti dengan query ke database sebenarnya.
    // Contoh pseudo-code:
    //
    // if (search) {
    //   return db('products')
    //     .whereILike('name', `%${search}%`)
    //     .orWhereILike('description', `%${search}%`);
    // }
    // return db('products').select('*');

    // Sementara return dummy data biar nggak error kalau dicoba.
    const dummy: Product[] = [
      {
        id: 1,
        name: 'Produk Contoh 1',
        price: 50000,
        description: 'Ini contoh produk 1',
        imageUrl: 'https://example.com/product1.jpg',
        stock: 10,
      },
      {
        id: 2,
        name: 'Produk Contoh 2',
        price: 75000,
        description: 'Ini contoh produk 2',
        imageUrl: 'https://example.com/product2.jpg',
        stock: 5,
      },
    ];

    if (search) {
      return dummy.filter((p) =>
        (p.name + (p.description ?? '')).toLowerCase().includes(search.toLowerCase())
      );
    }

    return dummy;
  }

  /**
   * Ambil detail 1 produk berdasarkan ID.
   */
  static async getProductById(id: number): Promise<Product | null> {
    // TODO: ganti dengan query ke database sebenarnya.
    // Contoh pseudo-code:
    //
    // const product = await db('products')
    //   .where({ id })
    //   .first();
    // return product ?? null;

    const all = await this.getProducts();
    const found = all.find((p) => p.id === id);
    return found ?? null;
  }
}
