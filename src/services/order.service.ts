import { Order } from '../models/order.model';
import { Product } from '../models/product.model';

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

interface CheckoutInput {
  userId: string;
  items: CheckoutItemInput[];
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
  const { userId, items } = input;

  if (!items || items.length === 0) {
    throw new Error('Keranjang kosong');
  }

  const productIds = items.map((i) => i.productId);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  if (dbProducts.length !== items.length) {
    throw new Error('Beberapa produk tidak ditemukan');
  }

  const orderItems = [];
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

  const order = await Order.create({
    userId,
    items: orderItems,
    totalAmount,
    invoiceNumber,
    paymentStatus: 'PENDING',
  });

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
