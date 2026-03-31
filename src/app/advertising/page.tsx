"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Share2, Globe, Clock, Wand2, Copy, Check, Calendar } from "lucide-react";

interface Product { id: string; name: string; price: string; category: string | null; }
interface AdResult {
  id: string;
  ad: {
    headline: string; body: string; hashtags: string[];
    callToAction: string; imagePrompt: string; platform: string;
  };
  product: Product;
}

const FREQUENCIES = [
  { value: "daily",    label: "Diario",         desc: "1 post por día" },
  { value: "every2",   label: "Cada 2 días",     desc: "15 posts/mes" },
  { value: "every3",   label: "Cada 3 días",     desc: "10 posts/mes" },
  { value: "weekly",   label: "Semanal",         desc: "4 posts/mes ⭐ Gratis" },
  { value: "biweekly", label: "Cada 2 semanas",  desc: "2 posts/mes" },
];

const TONES = [
  { value: "casual",       label: "Amigable 😊",     desc: "Cercano y natural" },
  { value: "professional", label: "Profesional 💼",   desc: "Serio y confiable" },
  { value: "funny",        label: "Divertido 😄",     desc: "Con humor LATAM" },
];

export default function AdvertisingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [platform, setPlatform] = useState<"both" | "instagram" | "facebook">("both");
  const [tone, setTone] = useState("casual");
  const [frequency, setFrequency] = useState("weekly");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<unknown[]>([]);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts);
    fetch("/api/advertising").then(r => r.json()).then(setScheduledPosts);
  }, []);

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/advertising", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct, platform, tone, frequency, whatsappNumber: whatsapp }),
      });
      const data = await res.json();
      setResult(data);
      // Refrescar posts programados
      fetch("/api/advertising").then(r => r.json()).then(setScheduledPosts);
    } finally {
      setLoading(false);
    }
  };

  const copyPost = () => {
    if (!result) return;
    const text = `${result.ad.headline}\n\n${result.ad.body}\n\n${result.ad.callToAction}\n\n${result.ad.hashtags.map(h => `#${h.replace("#","")}`).join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h1 className="text-xl font-bold">
              <span className="text-white">Flow</span><span className="text-violet-500">Sell</span>
              <span className="text-zinc-500 font-normal ml-2">/ Agente Publicidad</span>
            </h1>
          </div>
          <span className="ml-auto bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full">
            ✨ IA Generativa
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Configuración */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-violet-400" />
            Configura tu publicidad
          </h2>

          {/* Producto */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">¿Qué producto quieres promocionar?</label>
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="">— Selecciona un producto —</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>
              ))}
            </select>
          </div>

          {/* Plataforma */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">¿Dónde quieres publicar?</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: "both", label: "Ambas", icon: <Globe className="w-4 h-4" /> },
                { v: "instagram", label: "Instagram", icon: <Share2 className="w-4 h-4" /> },
                { v: "facebook", label: "Facebook", icon: <Share2 className="w-4 h-4" /> },
              ].map(({ v, label, icon }) => (
                <button key={v} onClick={() => setPlatform(v as typeof platform)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${platform === v ? "border-violet-500 bg-violet-500/10 text-violet-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-600"}`}>
                  <div className="flex gap-1">{icon}</div>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tono */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Tono del mensaje</label>
            <div className="grid grid-cols-3 gap-3">
              {TONES.map(t => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${tone === t.value ? "border-violet-500 bg-violet-500/10" : "border-zinc-700 hover:border-zinc-600"}`}>
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Frecuencia */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Frecuencia de publicación
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FREQUENCIES.map(f => (
                <button key={f.value} onClick={() => setFrequency(f.value)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${frequency === f.value ? "border-violet-500 bg-violet-500/10" : "border-zinc-700 hover:border-zinc-600"}`}>
                  <div className="text-xs font-medium">{f.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
            {(frequency === "daily" || frequency === "every2" || frequency === "every3") && (
              <p className="text-xs text-yellow-400 mt-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                ⭐ Programación personalizada disponible en Plan Pro ($9/mes)
              </p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Tu número de WhatsApp (opcional)</label>
            <input
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="+52 55 1234 5678"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-600 mt-1">Se incluirá el link de compra en el post</p>
          </div>

          {/* Botón generar */}
          <button
            onClick={handleGenerate}
            disabled={!selectedProduct || loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3"
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generando con IA...</>
            ) : (
              <><Sparkles className="w-5 h-5" />Generar publicidad con IA</>
            )}
          </button>
        </div>

        {/* Resultado */}
        {result && (
          <div className="bg-zinc-900/80 border border-violet-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-violet-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Post generado para {result.product.name}
              </h3>
              <button onClick={copyPost}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm transition-colors">
                {copied ? <><Check className="w-4 h-4 text-green-400" />¡Copiado!</> : <><Copy className="w-4 h-4" />Copiar post</>}
              </button>
            </div>

            {/* Preview del post */}
            <div className="bg-zinc-800 rounded-xl p-5 space-y-3">
              <p className="font-bold text-white text-lg">{result.ad.headline}</p>
              <p className="text-zinc-300 leading-relaxed">{result.ad.body}</p>
              <p className="text-violet-400 font-semibold">{result.ad.callToAction}</p>
              <p className="text-blue-400 text-sm">{result.ad.hashtags.map(h => `#${h.replace("#","")}`).join(" ")}</p>
            </div>

            {/* Info adicional */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-1">Imagen sugerida (IA)</p>
                <p className="text-xs text-zinc-300 italic">"{result.ad.imagePrompt}"</p>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-1">Próxima publicación</p>
                <p className="text-xs text-zinc-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {FREQUENCIES.find(f => f.value === frequency)?.label}
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-3 py-1.5 rounded-full">
                ✅ Guardado y programado
              </span>
              <span className="bg-zinc-800 text-zinc-400 text-xs px-3 py-1.5 rounded-full">
                📱 {platform === "both" ? "Instagram + Facebook" : platform}
              </span>
              <span className="bg-zinc-800 text-zinc-400 text-xs px-3 py-1.5 rounded-full">
                🔄 {FREQUENCIES.find(f => f.value === frequency)?.label}
              </span>
            </div>

            <p className="text-xs text-zinc-600 bg-zinc-800/50 rounded-lg p-3">
              💡 <strong className="text-zinc-400">Próximo paso:</strong> Conecta tu cuenta de Facebook Business para que el agente publique automáticamente. Por ahora puedes copiar el post y pegarlo manualmente.
            </p>
          </div>
        )}

        {/* Posts programados */}
        {Array.isArray(scheduledPosts) && scheduledPosts.length > 0 && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Posts programados ({scheduledPosts.length})
            </h3>
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {scheduledPosts.slice(0, 5).map((post: any) => (
                <div key={post.id} className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{post.product_name || "Producto"}</p>
                    <p className="text-xs text-zinc-500">{post.headline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">
                      {post.frequency === "weekly" ? "Semanal" : post.frequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
