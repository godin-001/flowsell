import { Product } from "@/lib/types";

export const catalogSystemPrompt = (products: Product[]) => `
Eres el Agente de Catálogo de FlowSell.
Tu rol: presentar productos de forma personalizada según el interés del cliente y moverlos hacia la compra.

CATÁLOGO DISPONIBLE:
${products
  .map(
    (p) =>
      `- ${p.name} | Precio: $${p.price} USDC | Stock: ${p.stock} | Categoría: ${p.category || "General"} | Descripción: ${p.description || "Sin descripción"}`
  )
  .join("\n")}

Reglas:
- Presenta máximo 2-3 productos por respuesta
- Destaca precio en USDC y disponibilidad
- Usa emojis moderadamente
- Cuando el cliente quiera comprar algo específico, di: [PHASE:checkout] y el nombre del producto
- Sé entusiasta pero no insistente
`;

export const catalogFallback = (userMessage: string, products: Product[]): string => {
  const lower = userMessage.toLowerCase();

  // Try to match product category
  const ropa = products.filter(p => p.category === "Ropa");
  const electronicos = products.filter(p => p.category === "Electrónicos");
  const alimentos = products.filter(p => p.category === "Alimentos");

  if (lower.includes("ropa") || lower.includes("polo") || lower.includes("camisa") || lower.includes("camiseta")) {
    const items = ropa.slice(0, 2);
    if (items.length > 0) {
      return `👕 En ropa tenemos:\n${items.map(p => `• **${p.name}** — $${p.price} USDC (Stock: ${p.stock})\n  ${p.description}`).join("\n\n")}\n\n¿Te interesa alguno? ¡Te ayudo a comprarlo! [PHASE:checkout]`;
    }
  }

  if (lower.includes("electrónico") || lower.includes("audifonos") || lower.includes("audífonos") || lower.includes("bluetooth")) {
    const items = electronicos.slice(0, 2);
    if (items.length > 0) {
      return `🎧 En electrónicos:\n${items.map(p => `• **${p.name}** — $${p.price} USDC (Stock: ${p.stock})\n  ${p.description}`).join("\n\n")}\n\n¿Lo quieres? [PHASE:checkout]`;
    }
  }

  if (lower.includes("fruta") || lower.includes("comida") || lower.includes("alimento") || lower.includes("canasta")) {
    const items = alimentos.slice(0, 2);
    if (items.length > 0) {
      return `🥭 En alimentos frescos:\n${items.map(p => `• **${p.name}** — $${p.price} USDC (Stock: ${p.stock})\n  ${p.description}`).join("\n\n")}\n\n¿Te animas? [PHASE:checkout]`;
    }
  }

  if (lower.includes("comprar") || lower.includes("quiero") || lower.includes("llevar") || lower.includes("cuánto")) {
    const featured = products.slice(0, 2);
    return `¡Excelente elección! Aquí nuestros más populares:\n${featured.map(p => `• **${p.name}** — $${p.price} USDC\n  ${p.description}`).join("\n\n")}\n\n¿Cuál te interesa? [PHASE:checkout]`;
  }

  // Default: show all products
  const showcase = products.slice(0, 3);
  return `🛍️ Aquí nuestro catálogo:\n\n${showcase.map(p => `• **${p.name}** — $${p.price} USDC | ${p.category}\n  ${p.description}`).join("\n\n")}\n\n¿Qué te llama la atención?`;
};
