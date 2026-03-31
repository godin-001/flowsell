require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const { v4: uuidv4 } = require("uuid");

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("🚀 Conectando a Neon...");

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      price       TEXT NOT NULL,
      description TEXT,
      image_url   TEXT,
      stock       INTEGER DEFAULT 0,
      category    TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ Tabla products");

  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id          TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      status      TEXT DEFAULT 'active',
      phase       TEXT DEFAULT 'inquiry',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ Tabla conversations");

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id              TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id),
      role            TEXT NOT NULL,
      content         TEXT NOT NULL,
      agent_type      TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ Tabla messages");

  // Drop y recrear orders con el schema correcto
  await sql`DROP TABLE IF EXISTS orders`;
  await sql`
    CREATE TABLE orders (
      id                    TEXT PRIMARY KEY,
      conversation_id       TEXT NOT NULL REFERENCES conversations(id),
      product_id            TEXT,
      quantity              INTEGER DEFAULT 1,
      total_amount          TEXT NOT NULL,
      currency              TEXT DEFAULT 'USDC',
      stellar_tx_hash       TEXT,
      buyer_stellar_address TEXT,
      status                TEXT DEFAULT 'pending',
      created_at            TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ Tabla orders (schema actualizado)");

  // Seed productos si la tabla está vacía
  const existing = await sql`SELECT COUNT(*) as count FROM products`;
  if (parseInt(existing[0].count) === 0) {
    await sql`
      INSERT INTO products (id, name, price, description, stock, category) VALUES
        (${uuidv4()}, 'Polo Premium', '25.00', 'Polo de algodón premium, todas las tallas. Colores: blanco, negro, azul.', 50, 'Ropa'),
        (${uuidv4()}, 'Audífonos Bluetooth', '45.00', 'Inalámbricos, 20h batería, cancelación de ruido activa.', 15, 'Electrónicos'),
        (${uuidv4()}, 'Canasta de Frutas', '18.00', 'Frutas frescas de temporada. Entrega en 24h.', 30, 'Alimentos')
    `;
    console.log("✅ Productos demo insertados");
  }

  console.log("\n🎉 Migración completa!");
}

migrate().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
