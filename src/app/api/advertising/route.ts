import { NextRequest, NextResponse } from "next/server";
import { generateAd } from "@/agents/advertising";
import { getProducts } from "@/lib/db";
import { neon } from "@neondatabase/serverless";
import { v4 as uuidv4 } from "uuid";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// Calcular próxima fecha según frecuencia
function getNextPostDate(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "daily":    now.setDate(now.getDate() + 1); break;
    case "every2":   now.setDate(now.getDate() + 2); break;
    case "every3":   now.setDate(now.getDate() + 3); break;
    case "weekly":   now.setDate(now.getDate() + 7); break;
    case "biweekly": now.setDate(now.getDate() + 14); break;
    default:         now.setDate(now.getDate() + 7);
  }
  return now;
}

// POST — generar contenido de ad
export async function POST(request: NextRequest) {
  const { productId, platform, tone, frequency, whatsappNumber } = await request.json();

  const products = await getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=Hola, quiero comprar ${encodeURIComponent(product.name)}`
    : undefined;

  const ad = await generateAd({
    product,
    platform: platform || "both",
    tone: tone || "casual",
    whatsappLink,
  });

  // Guardar en BD si está disponible
  let postId = uuidv4();
  if (sql) {
    const nextDate = getNextPostDate(frequency || "weekly");
    await sql`
      INSERT INTO scheduled_posts (id, product_id, platform, tone, headline, body, hashtags, call_to_action, image_prompt, frequency, status, next_post_at)
      VALUES (
        ${postId}, ${productId}, ${ad.platform}, ${tone || "casual"},
        ${ad.headline}, ${ad.body}, ${ad.hashtags.join(",")},
        ${ad.callToAction}, ${ad.imagePrompt},
        ${frequency || "weekly"}, 'scheduled', ${nextDate.toISOString()}
      )
    `;
  }

  return NextResponse.json({ id: postId, ad, product });
}

// GET — listar posts programados
export async function GET() {
  if (!sql) return NextResponse.json([]);
  const rows = await sql`
    SELECT sp.*, p.name as product_name, p.price, p.image_url
    FROM scheduled_posts sp
    LEFT JOIN products p ON sp.product_id = p.id
    ORDER BY sp.created_at DESC
    LIMIT 20
  `;
  return NextResponse.json(rows);
}
