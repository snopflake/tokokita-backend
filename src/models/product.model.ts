// src/models/product.model.ts

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  // tambahkan field lain yang kamu punya di tabel products
}
