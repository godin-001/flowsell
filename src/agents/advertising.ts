import { Product } from "@/lib/types";
import OpenAI from "openai";

export interface AdContent {
  headline: string;
  body: string;
  hashtags: string[];
  callToAction: string;
  imagePrompt: string; // Para generar imagen con IA
  platform: "instagram" | "facebook" | "both";
}

export async function generateAd(params: {
  product: Product;
  platform: "instagram" | "facebook" | "both";
  tone: "professional" | "casual" | "funny";
  whatsappLink?: string;
}): Promise<AdContent> {
  const { product, platform, tone, whatsappLink } = params;

  const apiKey = process.env.OPENROUTER_API_KEY;

  const toneGuide = {
    professional: "profesional y confiable, enfocado en calidad y valor",
    casual: "amigable y cercano, como hablarle a un amigo",
    funny: "divertido y memorable, con humor sutil LATAM",
  }[tone];

  const platformGuide = {
    instagram: "Instagram: usa emojis, texto corto, muy visual",
    facebook: "Facebook: puede ser más largo, storytelling, enfocado en comunidad",
    both: "funciona bien en Instagram y Facebook",
  }[platform];

  const prompt = `Eres un experto en marketing digital para emprendedores LATAM.

Genera contenido publicitario para este producto:
- Nombre: ${product.name}
- Precio: $${product.price} USD
- Descripción: ${product.description || "Sin descripción"}
- Categoría: ${product.category || "General"}
${whatsappLink ? `- Link de compra WhatsApp: ${whatsappLink}` : ""}

Tono: ${toneGuide}
Plataforma: ${platformGuide}

Responde SOLO con JSON válido en este formato exacto:
{
  "headline": "título llamativo (máx 10 palabras)",
  "body": "cuerpo del post (máx 150 caracteres para IG, 300 para FB)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "callToAction": "frase de llamada a la acción (máx 8 palabras)",
  "imagePrompt": "descripción en inglés para generar imagen del producto (para DALL-E)"
}`;

  if (apiKey) {
    try {
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
      });

      const completion = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.8,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(raw);

      return {
        headline: parsed.headline || `¡${product.name} disponible ahora!`,
        body: parsed.body || product.description || "",
        hashtags: parsed.hashtags || ["#emprendedor", "#LATAM", "#ventas"],
        callToAction: parsed.callToAction || "¡Compra ahora por WhatsApp!",
        imagePrompt: parsed.imagePrompt || `Professional product photo of ${product.name}`,
        platform,
      };
    } catch {
      // fallback
    }
  }

  // Fallback sin API
  return {
    headline: `¡${product.name} — Oferta especial! 🔥`,
    body: `${product.description || product.name} por solo $${product.price} USDC. ¡Unidades limitadas!`,
    hashtags: ["#emprendedor", "#LATAM", "#oferta", "#calidad", `#${product.category?.toLowerCase() || "productos"}`],
    callToAction: "¡Escríbenos por WhatsApp ahora!",
    imagePrompt: `Professional product photo of ${product.name} on white background`,
    platform,
  };
}
