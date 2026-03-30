import { Product, Message, Conversation, Order } from "./types";
import { v4 as uuidv4 } from "uuid";

// In-memory mock store (used when DATABASE_URL is not set)
let mockProducts: Product[] = [
  {
    id: "1",
    name: "Polo Premium",
    price: "25.00",
    description: "Polo de algodón premium, disponible en todas las tallas. Colores: blanco, negro, azul marino.",
    imageUrl: null,
    stock: 50,
    category: "Ropa",
  },
  {
    id: "2",
    name: "Audífonos Bluetooth",
    price: "45.00",
    description: "Audífonos inalámbricos con 20h de batería, cancelación de ruido activa y carga rápida.",
    imageUrl: null,
    stock: 15,
    category: "Electrónicos",
  },
  {
    id: "3",
    name: "Canasta de Frutas",
    price: "18.00",
    description: "Canasta con frutas frescas de temporada: mango, papaya, piña, fresas. Entrega en 24h.",
    imageUrl: null,
    stock: 30,
    category: "Alimentos",
  },
];

let mockConversations: Conversation[] = [];
let mockMessages: Message[] = [];
let mockOrders: Order[] = [];

const useDB = !!process.env.DATABASE_URL;

// Products
export async function getProducts(): Promise<Product[]> {
  if (useDB) {
    // TODO: implement with Neon
    return mockProducts;
  }
  return mockProducts;
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  const product: Product = { ...data, id: uuidv4() };
  mockProducts.push(product);
  return product;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const idx = mockProducts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  mockProducts[idx] = { ...mockProducts[idx], ...data };
  return mockProducts[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const len = mockProducts.length;
  mockProducts = mockProducts.filter((p) => p.id !== id);
  return mockProducts.length < len;
}

// Conversations
export async function getOrCreateConversation(customerId: string): Promise<Conversation> {
  let conv = mockConversations.find((c) => c.customerId === customerId && c.status === "active");
  if (!conv) {
    conv = { id: uuidv4(), customerId, status: "active", phase: "inquiry" };
    mockConversations.push(conv);
  }
  return conv;
}

export async function updateConversationPhase(id: string, phase: Conversation["phase"]): Promise<void> {
  const conv = mockConversations.find((c) => c.id === id);
  if (conv) conv.phase = phase;
}

// Messages
export async function getMessages(conversationId: string): Promise<Message[]> {
  return mockMessages.filter((m) => m.conversationId === conversationId);
}

export async function saveMessage(data: Omit<Message, "id" | "createdAt">): Promise<Message> {
  const msg: Message = { ...data, id: uuidv4() };
  mockMessages.push(msg);
  return msg;
}

// Orders
export async function createOrder(data: Omit<Order, "id" | "createdAt">): Promise<Order> {
  const order: Order = { ...data, id: uuidv4() };
  mockOrders.push(order);
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
  txHash?: string
): Promise<Order | null> {
  const order = mockOrders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  if (txHash) order.stellarTxHash = txHash;
  return order;
}

export async function getOrders(): Promise<Order[]> {
  return mockOrders;
}
