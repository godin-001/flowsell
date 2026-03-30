import { Product } from "@/lib/types";

export const informerSystemPrompt = (products: Product[]) => `
Eres el Agente Informador de FlowSell, una tienda online.
Tu rol: responder preguntas generales sobre la tienda y guiar al cliente hacia explorar el catálogo.

Productos disponibles (categorías): ${[...new Set(products.map((p) => p.category).filter(Boolean))].join(", ")}
Total de productos: ${products.length}

Reglas:
- Sé amigable, conciso y en español
- Si preguntan por productos específicos, diles que el agente de catálogo los puede ayudar
- Cuando el cliente muestre interés en ver productos, finaliza con: [PHASE:browsing]
- No hagas preguntas largas, máximo 2 frases de respuesta
`;

export const informerFallback = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();
  if (lower.includes("hola") || lower.includes("buenas") || lower.includes("hey")) {
    return "¡Hola! Bienvenido a FlowSell 👋 Somos tu tienda online de confianza. ¿Te gustaría ver nuestro catálogo de productos? [PHASE:browsing]";
  }
  if (lower.includes("catálogo") || lower.includes("productos") || lower.includes("qué venden") || lower.includes("que venden")) {
    return "¡Claro! Tenemos ropa, electrónicos y alimentos frescos. ¿Te muestro el catálogo? [PHASE:browsing]";
  }
  if (lower.includes("precio") || lower.includes("costo") || lower.includes("cuánto")) {
    return "Nuestros precios son en USDC via Stellar — muy conveniente y sin comisiones altas. ¿Quieres ver los precios del catálogo? [PHASE:browsing]";
  }
  if (lower.includes("pago") || lower.includes("cómo pago") || lower.includes("como pago")) {
    return "Aceptamos pagos en USDC a través de la red Stellar — rápido, seguro y sin intermediarios. ¿Hay algo que te interese comprar?";
  }
  return "Estoy aquí para ayudarte 😊 Tenemos un catálogo variado con excelentes precios. ¿Te gustaría explorar nuestros productos? [PHASE:browsing]";
};
