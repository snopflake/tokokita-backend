import mongoose, { Schema, Document } from 'mongoose';

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  invoiceNumber: string;
  paymentStatus: 'PENDING' | 'PAID_SIMULATED' | 'FAILED';
  createdAt: Date;
}


const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    // address: { type: String, required: true },  // ← HAPUS
    // phone: { type: String, required: true },    // ← HAPUS
    invoiceNumber: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID_SIMULATED', 'FAILED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
