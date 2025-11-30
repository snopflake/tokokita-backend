// src/services/order.service.ts

import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { User } from '../models/User';
import { createMidtransTransaction } from './midtrans.service';

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

interface CheckoutInput {
  userId: string;
  items: CheckoutItemInput[];

  // 🔐 data pribadi yang akan dienkripsi di model
  address: string;
  phone: string;
}

function generateInvoiceNumber(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  // Timestamp biar pasti unik
  const timestamp = Date.now();

  return `INV-${year}${month}${day}-${timestamp}`;
}

export async function checkoutService(input: CheckoutInput) {
  const { userId, items, address, phone } = input;

  // --- Validasi dasar ---
  if (!items || items.length === 0) {
    throw new Error('Keranjang kosong');
  }

  if (!address || !phone) {
    throw new Error('Alamat dan nomor telepon wajib diisi');
  }

  // --- Ambil produk dari DB ---
  const productIds = items.map((i) => i.productId);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  if (dbProducts.length !== items.length) {
    throw new Error('Beberapa produk tidak ditemukan');
  }

  const orderItems: {
    productId: any;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[] = [];
  let totalAmount = 0;

  for (const item of items) {
    const prod = dbProducts.find(
      (p) => p._id.toString() === item.productId
    );
    if (!prod) throw new Error('Produk tidak ditemukan');

    if (prod.stock < item.quantity) {
      throw new Error(`Stok tidak cukup untuk produk: ${prod.name}`);
    }

    const subtotal = prod.price * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      productId: prod._id,
      name: prod.name,
      price: prod.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  const invoiceNumber = generateInvoiceNumber();

  // --- Ambil data user untuk customer_details Midtrans ---
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  // --- Buat Order di MongoDB (belum dibayar) ---
  const order = new Order({
    userId,
    items: orderItems,
    totalAmount,
    invoiceNumber,
    paymentStatus: 'WAITING_PAYMENT', // menunggu pembayaran Midtrans
  });

  // 🔐 simpan alamat & no HP terenkripsi di DB
  order.setContactInfo(address, phone);

  // --- Panggil Midtrans Snap (Sandbox) ---
  const midtransTransaction: any = await createMidtransTransaction({
    orderId: invoiceNumber,
    grossAmount: totalAmount,
    customer: {
      fullName: user.fullName,
      email: user.email,
      phone,
    },
  });

  // Simpan informasi terkait Midtrans ke dalam Order
  order.midtransOrderId = invoiceNumber;
  order.midtransTransactionId = midtransTransaction.transaction_id;
  order.midtransRedirectUrl = midtransTransaction.redirect_url;
  order.midtransStatusRaw = midtransTransaction;

  await order.save();

  /**
   * ⚠️ Penting:
   * - Kita TIDAK langsung mengurangi stok dan TIDAK set status PAID di sini.
   * - Idealnya, stok dikurangi & paymentStatus diubah ke 'PAID'
   *   setelah Midtrans mengirim notifikasi (callback) bahwa transaksi settlement.
   *
   * Nanti bisa kita tambahkan di endpoint /api/payment/midtrans/callback.
   */

  return order;
}
