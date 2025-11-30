// src/services/midtrans.service.ts
import { snap } from '../config/midtrans';

interface CreateMidtransTransactionInput {
  orderId: string;        // pakai invoiceNumber kita
  grossAmount: number;    // totalAmount
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export async function createMidtransTransaction(input: CreateMidtransTransactionInput) {
  const { orderId, grossAmount, customer } = input;

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customer.fullName,
      email: customer.email,
      phone: customer.phone,
    },
    credit_card: {
      secure: true,
    },
  };

  const transaction = await snap.createTransaction(parameter);
  return transaction; // ada token & redirect_url
}
