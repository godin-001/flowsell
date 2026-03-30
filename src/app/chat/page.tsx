"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Bot, Brain, ShieldCheck, User } from "lucide-react";

type Phase = "inquiry" | "browsing" | "checkout" | "completed";
type AgentType = "informer" | "catalog" | "checkout";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentType?: AgentType;
}

const agentConfig: Record<AgentType, { label: string; icon: typeof Bot; color: string }> = {
  informer: { label: "Informador", icon: Bot, color: "text-blue-400" },
  catalog: { label: "Catálogo", icon: Brain, color: "text-violet-400" },
  checkout: { label: "Checkout", icon: ShieldCheck, color: "text-green-400" },
};

const phaseLabels: Record<Phase, string> = {
  inquiry: "Consulta",
  browsing: "Catálogo",
  checkout: "Checkout",
  completed: "Completado",
};

const phaseSteps: Phase[] = ["inquiry", "browsing", "checkout", "completed"];

function cleanContent(content: string): string {
  return content
    .replace(/\[PHASE:\w+\]/g, "")
    .replace(/\[ORDER:\{[^}]+\}\]/g, "")
    .trim();
}

function extractOrder(content: string): { productId: string; quantity: number; totalAmount: string; buyerAddress: string } | null {
  const match = content.match(/\[ORDER:(\{[^}]+\})\]/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("inquiry");
  const [agentType, setAgentType] = useState<AgentType>("informer");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const customerId = useRef(`customer-${Date.now()}`);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: "greeting",
        role: "assistant",
        content: "¡Hola! Bienvenido a FlowSell. Somos tu tienda online de confianza. ¿Te gustaría ver nuestro catálogo de productos?",
        agentType: "informer",
      },
    ]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId.current,
          message: userMsg.content,
        }),
      });

      const data = await res.json();

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.phase) setPhase(data.phase);
      if (data.agentType) setAgentType(data.agentType);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        agentType: data.agentType,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Check for order in response
      const order = extractOrder(data.response);
      if (order && data.phase === "checkout") {
        // Will show confirm button
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Lo siento, hubo un error. Intenta de nuevo.",
          agentType: "informer",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Check last message for order
  const lastMessage = messages[messages.length - 1];
  const pendingOrder = lastMessage?.role === "assistant" ? extractOrder(lastMessage.content) : null;

  const Agent = agentConfig[agentType];
  const AgentIcon = Agent.icon;

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.push("/")} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <AgentIcon className={`w-5 h-5 ${Agent.color}`} />
              <span className="text-white font-semibold">Agente {Agent.label}</span>
              <span className="text-zinc-600 text-sm">/ {phaseLabels[phase]}</span>
            </div>
          </div>
          {/* Phase bar */}
          <div className="flex items-center gap-1">
            {phaseSteps.map((step, i) => {
              const isActive = phaseSteps.indexOf(phase) >= i;
              const isCurrent = phase === step;
              return (
                <div key={step} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`h-1.5 w-full rounded-full transition-colors ${
                      isActive ? "bg-violet-500" : "bg-zinc-800"
                    } ${isCurrent ? "animate-pulse" : ""}`}
                  />
                  <span className={`text-[10px] ${isActive ? "text-violet-400" : "text-zinc-600"}`}>
                    {phaseLabels[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const agent = msg.agentType ? agentConfig[msg.agentType] : null;
            const MsgIcon = agent?.icon || Bot;

            return (
              <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[85%] ${isUser ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isUser ? "bg-violet-600" : "bg-zinc-800"
                    }`}
                  >
                    {isUser ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <MsgIcon className={`w-4 h-4 ${agent?.color || "text-zinc-400"}`} />
                    )}
                  </div>

                  {/* Bubble */}
                  <div>
                    {!isUser && agent && (
                      <span className={`text-[10px] ${agent.color} mb-1 block`}>
                        {agent.label}
                      </span>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-violet-600 text-white rounded-br-md"
                          : "bg-zinc-800/80 text-zinc-200 border border-zinc-700/50 rounded-bl-md"
                      }`}
                    >
                      {cleanContent(msg.content)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <AgentIcon className={`w-4 h-4 ${Agent.color}`} />
                </div>
                <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirm payment button */}
          {pendingOrder && phase === "checkout" && (
            <div className="flex justify-center py-2">
              <button
                onClick={() =>
                  router.push(
                    `/confirm?productId=${pendingOrder.productId}&amount=${pendingOrder.totalAmount}&address=${pendingOrder.buyerAddress}&conversationId=${conversationId || "direct"}`
                  )
                }
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors animate-pulse"
              >
                <ShieldCheck className="w-5 h-5" />
                Confirmar pago en Stellar
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none text-sm"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-3 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 rounded-xl transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
