import { Order } from '../models/order.model';
import { Product } from '../models/product.model';

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

  if (!items || items.length === 0) {
    throw new Error('Keranjang kosong');
  }

  if (!address || !phone) {
    throw new Error('Alamat dan nomor telepon wajib diisi');
  }

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

  // 🔐 gunakan constructor + helper supaya alamat/HP terenkripsi
  const order = new Order({
    userId,
    items: orderItems,
    totalAmount,
    invoiceNumber,
    paymentStatus: 'PENDING',
  });

  order.setContactInfo(address, phone);

  await order.save();

  // simulasi payment + update stok
  for (const item of items) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: -item.quantity } }
    );
  }

  order.paymentStatus = 'PAID_SIMULATED';
  await order.save();

  return order;
}
