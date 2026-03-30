export interface PaymentRequest {
  paymentAddress: string;
  amount: string;
  memo: string;
  network: string;
  currency: string;
}

// Demo Stellar testnet merchant address
const MERCHANT_ADDRESS = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

export function createPaymentRequest(params: {
  amount: string;
  orderId: string;
  productName: string;
}): PaymentRequest {
  return {
    paymentAddress: MERCHANT_ADDRESS,
    amount: params.amount,
    memo: params.orderId.slice(0, 28),
    network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet",
    currency: "USDC",
  };
}

export async function verifyPayment(txHash: string): Promise<{ valid: boolean; error?: string }> {
  // For demo: accept any 64-char hex hash as "valid"
  if (txHash.length >= 10) {
    return { valid: true };
  }
  return { valid: false, error: "Hash inválido" };
}
