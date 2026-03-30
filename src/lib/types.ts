export interface Product {
  id: string;
  name: string;
  price: string;
  description: string | null;
  imageUrl: string | null;
  stock: number;
  category: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  agentType?: "informer" | "catalog" | "checkout";
  createdAt?: Date;
}

export interface Conversation {
  id: string;
  customerId: string;
  status: "active" | "completed" | "abandoned";
  phase: "inquiry" | "browsing" | "checkout" | "completed";
  createdAt?: Date;
}

export interface Order {
  id: string;
  conversationId: string;
  productId: string;
  quantity: number;
  totalAmount: string;
  currency: string;
  status: "pending" | "paid" | "failed";
  stellarTxHash?: string | null;
  buyerStellarAddress?: string | null;
  createdAt?: Date;
}

export type AgentType = "informer" | "catalog" | "checkout";
export type Phase = "inquiry" | "browsing" | "checkout" | "completed";
