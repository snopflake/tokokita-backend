// src/services/order.service.ts
import { Order } from '../models/Order';
import { encrypt } from '../config/security';
import { createPayment } from './payment.service';
import mongoose from 'mongoose';

interface OrderItemPayload {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderPayload {
  items: OrderItemPayload[];
  totalAmount: number;
  address: string;
  phone: string;
}

export async function createOrder(
  userId: string,
  payload: CreateOrderPayload
) {
  const { items, totalAmount, address, phone } = payload;

  if (!items || !items.length) {
    throw new Error('Order items cannot be empty');
  }

  // Panggil payment gateway (simulasi)
  const payment = await createPayment(totalAmount);

  const encryptedAddress = encrypt(address);
  const encryptedPhone = encrypt(phone);

  const order = await Order.create({
    userId: new mongoose.Types.ObjectId(userId),
    items,
    totalAmount,
    encryptedAddress,
    encryptedPhone,
    paymentStatus: payment.status,
    paymentTransactionId: payment.transactionId
  });

  return { order, payment };
}
