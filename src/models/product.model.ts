import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  stock: number;
  // tambahkan field lain kalau perlu
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
