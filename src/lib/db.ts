import { Product, Message, Conversation, Order } from "./types";
import { v4 as uuidv4 } from "uuid";
import { neon } from "@neondatabase/serverless";

const useDB = !!process.env.DATABASE_URL;
const sql = useDB ? neon(process.env.DATABASE_URL!) : null;

// ─── Mock fallback ─────────────────────────────────────────────────────────────

let mockProducts: Product[] = [
  { id: "1", name: "Polo Premium", price: "25.00", description: "Polo de algodón premium, todas las tallas.", imageUrl: null, stock: 50, category: "Ropa" },
  { id: "2", name: "Audífonos Bluetooth", price: "45.00", description: "Inalámbricos, 20h batería, cancelación de ruido.", imageUrl: null, stock: 15, category: "Electrónicos" },
  { id: "3", name: "Canasta de Frutas", price: "18.00", description: "Frutas frescas de temporada. Entrega 24h.", imageUrl: null, stock: 30, category: "Alimentos" },
];
let mockConversations: Conversation[] = [];
let mockMessages: Message[] = [];
let mockOrders: Order[] = [];

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  if (!sql) return mockProducts;
  const rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
  return rows.map(rowToProduct);
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  if (!sql) {
    const product: Product = { ...data, id: uuidv4() };
    mockProducts.push(product);
    return product;
  }
  const id = uuidv4();
  const rows = await sql`
    INSERT INTO products (id, name, price, description, image_url, stock, category)
    VALUES (${id}, ${data.name}, ${data.price}, ${data.description ?? null},
            ${data.imageUrl ?? null}, ${data.stock ?? 0}, ${data.category ?? null})
    RETURNING *
  `;
  return rowToProduct(rows[0]);
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  if (!sql) {
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    mockProducts[idx] = { ...mockProducts[idx], ...data };
    return mockProducts[idx];
  }
  const rows = await sql`
    UPDATE products SET
      name        = COALESCE(${data.name ?? null}, name),
      price       = COALESCE(${data.price ?? null}, price),
      description = COALESCE(${data.description ?? null}, description),
      image_url   = COALESCE(${data.imageUrl ?? null}, image_url),
      stock       = COALESCE(${data.stock ?? null}, stock),
      category    = COALESCE(${data.category ?? null}, category),
      updated_at  = NOW()
    WHERE id = ${id} RETURNING *
  `;
  return rows.length ? rowToProduct(rows[0]) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!sql) {
    const len = mockProducts.length;
    mockProducts = mockProducts.filter((p) => p.id !== id);
    return mockProducts.length < len;
  }
  const result = await sql`DELETE FROM products WHERE id = ${id}`;
  return (result as unknown as { count: number }).count > 0;
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function getOrCreateConversation(customerId: string): Promise<Conversation> {
  if (!sql) {
    let conv = mockConversations.find((c) => c.customerId === customerId && c.status === "active");
    if (!conv) {
      conv = { id: uuidv4(), customerId, status: "active", phase: "inquiry" };
      mockConversations.push(conv);
    }
    return conv;
  }
  const existing = await sql`SELECT * FROM conversations WHERE customer_id = ${customerId} AND status = 'active' LIMIT 1`;
  if (existing.length) return rowToConversation(existing[0]);
  const id = uuidv4();
  const rows = await sql`
    INSERT INTO conversations (id, customer_id, status, phase)
    VALUES (${id}, ${customerId}, 'active', 'inquiry') RETURNING *
  `;
  return rowToConversation(rows[0]);
}

export async function updateConversationPhase(id: string, phase: Conversation["phase"]): Promise<void> {
  if (!sql) {
    const conv = mockConversations.find((c) => c.id === id);
    if (conv) conv.phase = phase;
    return;
  }
  await sql`UPDATE conversations SET phase = ${phase} WHERE id = ${id}`;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getMessages(conversationId: string): Promise<Message[]> {
  if (!sql) return mockMessages.filter((m) => m.conversationId === conversationId);
  const rows = await sql`SELECT * FROM messages WHERE conversation_id = ${conversationId} ORDER BY created_at ASC`;
  return rows.map(rowToMessage);
}

export async function saveMessage(data: Omit<Message, "id" | "createdAt">): Promise<Message> {
  if (!sql) {
    const msg: Message = { ...data, id: uuidv4() };
    mockMessages.push(msg);
    return msg;
  }
  const id = uuidv4();
  const rows = await sql`
    INSERT INTO messages (id, conversation_id, role, content, agent_type)
    VALUES (${id}, ${data.conversationId}, ${data.role}, ${data.content}, ${data.agentType ?? null})
    RETURNING *
  `;
  return rowToMessage(rows[0]);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(data: Omit<Order, "id" | "createdAt">): Promise<Order> {
  if (!sql) {
    const order: Order = { ...data, id: uuidv4() };
    mockOrders.push(order);
    return order;
  }
  const id = uuidv4();
  const rows = await sql`
    INSERT INTO orders (id, conversation_id, product_id, quantity, total_amount, currency, stellar_tx_hash, buyer_stellar_address, status)
    VALUES (${id}, ${data.conversationId}, ${data.productId ?? null}, ${data.quantity ?? 1},
            ${data.totalAmount}, ${data.currency ?? "USDC"}, ${data.stellarTxHash ?? null},
            ${data.buyerStellarAddress ?? null}, ${data.status})
    RETURNING *
  `;
  return rowToOrder(rows[0]);
}

export async function updateOrderStatus(id: string, status: Order["status"], txHash?: string): Promise<Order | null> {
  if (!sql) {
    const order = mockOrders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    if (txHash) order.stellarTxHash = txHash;
    return order;
  }
  const rows = await sql`
    UPDATE orders SET status = ${status},
      stellar_tx_hash = COALESCE(${txHash ?? null}, stellar_tx_hash)
    WHERE id = ${id} RETURNING *
  `;
  return rows.length ? rowToOrder(rows[0]) : null;
}

export async function getOrders(): Promise<Order[]> {
  if (!sql) return mockOrders;
  const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
  return rows.map(rowToOrder);
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(r: any): Product {
  return { id: r.id, name: r.name, price: r.price, description: r.description, imageUrl: r.image_url, stock: r.stock, category: r.category };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToConversation(r: any): Conversation {
  return { id: r.id, customerId: r.customer_id, status: r.status, phase: r.phase };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMessage(r: any): Message {
  return { id: r.id, conversationId: r.conversation_id, role: r.role, content: r.content, agentType: r.agent_type };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(r: any): Order {
  return {
    id: r.id, conversationId: r.conversation_id, productId: r.product_id,
    quantity: r.quantity, totalAmount: r.total_amount, currency: r.currency,
    status: r.status, stellarTxHash: r.stellar_tx_hash, buyerStellarAddress: r.buyer_stellar_address,
  };
}
