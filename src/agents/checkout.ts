import { Product } from "@/lib/types";

export const checkoutSystemPrompt = (products: Product[]) => `
Eres el Agente de Checkout de FlowSell.
Tu rol: ayudar al cliente a completar su compra vía Stellar USDC.

CATÁLOGO:
${products
  .map(
    (p) =>
      `- ${p.name} (ID: ${p.id}) | $${p.price} USDC | Stock: ${p.stock}`
  )
  .join("\n")}

Reglas:
- Confirma el producto y cantidad
- Pide la dirección Stellar del comprador (empieza con G, 56 caracteres)
- Cuando tengas todos los datos, responde con: [ORDER:{"productId":"ID","quantity":1,"totalAmount":"PRECIO","buyerAddress":"DIRECCION"}]
- Sé claro y directo — el cliente está listo para pagar
`;

export const checkoutFallback = (userMessage: string, products: Product[]): string => {
  const lower = userMessage.toLowerCase();

  // Check for Stellar address
  const addressMatch = userMessage.match(/G[A-Z2-7]{55}/);
  if (addressMatch) {
    const address = addressMatch[0];
    // Try to find the product they want
    const product = products[0]; // Default to first product
    return `✅ ¡Perfecto! Confirmando tu orden:\n\n• **${product.name}** x1\n• Total: $${product.price} USDC\n• Tu dirección: ${address.slice(0, 8)}...${address.slice(-4)}\n\nProcesando pago en Stellar... [ORDER:{"productId":"${product.id}","quantity":1,"totalAmount":"${product.price}","buyerAddress":"${address}"}]`;
  }

  // Check for product mentions to contextualize
  for (const p of products) {
    if (lower.includes(p.name.toLowerCase()) || lower.includes(p.id)) {
      return `¡Excelente! Para completar la compra de **${p.name}** ($${p.price} USDC), necesito tu dirección de wallet Stellar.\n\nEs una dirección que empieza con la letra **G** y tiene 56 caracteres. ¿La tienes lista? 🔐`;
    }
  }

  if (lower.includes("comprar") || lower.includes("quiero") || lower.includes("sí") || lower.includes("si") || lower.includes("dale")) {
    const p = products[0];
    return `¡Vamos a ello! Para completar tu compra de **${p.name}** ($${p.price} USDC), necesito tu dirección de wallet Stellar.\n\nEmpieza con **G** y tiene 56 caracteres. ¿Me la compartes? 🔐`;
  }

  return `Para completar tu compra, necesito tu dirección de wallet Stellar (empieza con **G**, 56 caracteres).\n\n¿No tienes wallet? Puedes crear una gratis en [Stellar Laboratory](https://laboratory.stellar.org) 🚀`;
};
