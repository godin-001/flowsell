"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, MessageCircle, CreditCard, Bot, Brain, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 text-center mb-12">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight">
          <span className="text-white">Flow</span>
          <span className="text-violet-500">Sell</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl mt-3 font-medium">
          Ordena y vende sin esfuerzo
        </p>
        <p className="text-zinc-600 text-sm mt-2">
          Multi-agent commerce para emprendedores LATAM
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl mb-12">
        <button
          onClick={() => router.push("/setup")}
          className="group flex flex-col items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/50 hover:bg-zinc-900 transition-all duration-300"
        >
          <div className="p-3 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
            <ShoppingBag className="w-7 h-7 text-violet-400" />
          </div>
          <span className="text-white font-semibold">Setup</span>
          <span className="text-zinc-500 text-xs">Gestionar productos</span>
        </button>

        <button
          onClick={() => router.push("/chat")}
          className="group flex flex-col items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/50 hover:bg-zinc-900 transition-all duration-300"
        >
          <div className="p-3 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
            <MessageCircle className="w-7 h-7 text-violet-400" />
          </div>
          <span className="text-white font-semibold">Chat</span>
          <span className="text-zinc-500 text-xs">Comprar con agentes</span>
        </button>

        <button
          onClick={() => router.push("/confirm?productId=1&amount=25.00&address=demo&conversationId=demo")}
          className="group flex flex-col items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/50 hover:bg-zinc-900 transition-all duration-300"
        >
          <div className="p-3 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
            <CreditCard className="w-7 h-7 text-violet-400" />
          </div>
          <span className="text-white font-semibold">Demo Pago</span>
          <span className="text-zinc-500 text-xs">Stellar x402</span>
        </button>

        <button
          onClick={() => router.push("/advertising")}
          className="group flex flex-col items-center gap-3 bg-zinc-900/80 border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/50 hover:bg-zinc-900 transition-all duration-300"
        >
          <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
            <Sparkles className="w-7 h-7 text-yellow-400" />
          </div>
          <span className="text-white font-semibold">Publicidad</span>
          <span className="text-zinc-500 text-xs">Agente IA ✨</span>
        </button>
      </div>

      {/* Hackathon badge */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-full px-5 py-2.5">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-zinc-400 text-sm font-medium">
            Stellar Agents Hackathon — DoraHacks 2025
          </span>
        </div>
      </div>

      {/* Agent pills */}
      <div className="relative z-10 flex flex-wrap justify-center gap-3">
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 rounded-full px-4 py-2">
          <Bot className="w-4 h-4 text-blue-400" />
          <span className="text-zinc-400 text-xs">Agente Informador</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 rounded-full px-4 py-2">
          <Brain className="w-4 h-4 text-violet-400" />
          <span className="text-zinc-400 text-xs">Agente Catálogo</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 rounded-full px-4 py-2">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span className="text-zinc-400 text-xs">Agente Checkout</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-yellow-500/20 rounded-full px-4 py-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-zinc-400 text-xs">Agente Publicidad</span>
        </div>
      </div>
    </div>
  );
}
