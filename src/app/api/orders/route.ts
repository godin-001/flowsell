import { NextRequest, NextResponse } from "next/server";
import { createOrder, updateOrderStatus, getOrders } from "@/lib/db";
import { createPaymentRequest, verifyPayment } from "@/lib/stellar";

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const order = await createOrder({
    conversationId: body.conversationId || "direct",
    productId: body.productId,
    quantity: body.quantity || 1,
    totalAmount: body.totalAmount,
    currency: "USDC",
    status: "pending",
    stellarTxHash: null,
    buyerStellarAddress: body.buyerAddress || null,
  });

  const payment = createPaymentRequest({
    amount: body.totalAmount,
    orderId: order.id,
    productName: body.productName || "Producto",
  });

  return NextResponse.json({ order, payment }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { orderId, txHash } = await request.json();

  if (!orderId || !txHash) {
    return NextResponse.json({ error: "orderId y txHash son requeridos" }, { status: 400 });
  }

  const verification = await verifyPayment(txHash);
  if (!verification.valid) {
    return NextResponse.json({ error: verification.error || "Pago inválido" }, { status: 400 });
  }

  const order = await updateOrderStatus(orderId, "paid", txHash);
  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ order, verified: true });
}
