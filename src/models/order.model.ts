// src/models/order.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { encrypt, decrypt } from '../config/security';

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

  paymentStatus:
    | 'PENDING'
    | 'PAID_SIMULATED'
    | 'FAILED'
    | 'WAITING_PAYMENT'
    | 'PAID';

  midtransOrderId?: string;
  midtransTransactionId?: string;
  midtransRedirectUrl?: string;
  midtransStatusRaw?: any;

  createdAt: Date;
  updatedAt: Date;

  // 🔐 data pribadi disimpan terenkripsi
  addressEnc: string;
  phoneEnc: string;

  // 🔧 helper methods
  setContactInfo(address: string, phone: string): void;
  getContactInfo(): { address: string; phone: string };
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

    // ❌ jangan pakai plain text lagi
    // address: { type: String, required: true },
    // phone: { type: String, required: true },

    // ✅ simpan terenkripsi
    addressEnc: { type: String, required: true },
    phoneEnc: { type: String, required: true },

    invoiceNumber: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID_SIMULATED', 'FAILED', 'WAITING_PAYMENT', 'PAID'],
      default: 'PENDING',
    },

    midtransOrderId: { type: String },
    midtransTransactionId: { type: String },
    midtransRedirectUrl: { type: String },
    midtransStatusRaw: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// 🔧 setContactInfo → enkripsi sebelum disimpan
OrderSchema.methods.setContactInfo = function (address: string, phone: string) {
  this.addressEnc = encrypt(address);
  this.phoneEnc = encrypt(phone);
};

// 🔧 getContactInfo → dekripsi saat dibaca
OrderSchema.methods.getContactInfo = function () {
  return {
    address: this.addressEnc ? decrypt(this.addressEnc) : '',
    phone: this.phoneEnc ? decrypt(this.phoneEnc) : '',
  };
};

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
