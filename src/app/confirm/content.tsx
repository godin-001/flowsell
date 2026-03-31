"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check, ShieldCheck, ExternalLink, CheckCircle2, Sparkles } from "lucide-react";
import { StellarWallet } from "@/components/StellarWallet";

const MERCHANT_ADDRESS = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

export function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") || "1";
  const amount = searchParams.get("amount") || "25.00";
  const address = searchParams.get("address") || "";
  const conversationId = searchParams.get("conversationId") || "direct";

  const [orderId, setOrderId] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [txHash, setTxHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [productName, setProductName] = useState("Producto");

  const createOrderOnMount = useCallback(async () => {
    try {
      // Fetch product name
      const prodRes = await fetch("/api/products");
      const products = await prodRes.json();
      const product = products.find((p: { id: string; name: string }) => p.id === productId);
      if (product) setProductName(product.name);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          productId,
          quantity: 1,
          totalAmount: amount,
          buyerAddress: address,
          productName: product?.name || "Producto",
        }),
      });
      const data = await res.json();
      setOrderId(data.order.id);
      setMemo(data.payment.memo);
    } catch {
      // Fallback
      setOrderId("demo-order");
      setMemo("demo-memo");
    }
  }, [productId, amount, address, conversationId]);

  useEffect(() => {
    createOrderOnMount();
  }, [createOrderOnMount]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleVerify = async () => {
    if (!txHash.trim() || !orderId) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, txHash }),
      });
      const data = await res.json();
      if (data.verified) {
        setVerified(true);
      }
    } catch {
      // ignore
    } finally {
      setVerifying(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* Confetti-style sparkles */}
          <div className="relative mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -left-4 animate-ping" />
            <Sparkles className="w-4 h-4 text-violet-400 absolute -top-4 right-0 animate-ping" style={{ animationDelay: "200ms" }} />
            <Sparkles className="w-5 h-5 text-green-400 absolute top-8 -right-6 animate-ping" style={{ animationDelay: "400ms" }} />
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-green-500">
              <CheckCircle2 className="w-14 h-14 text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">¡Pago confirmado!</h1>
          <p className="text-zinc-400 mb-6">Tu transacción ha sido verificada en la red Stellar</p>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-zinc-500">Producto</span>
              <span className="text-white font-medium">{productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Total</span>
              <span className="text-violet-400 font-bold">${amount} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Red</span>
              <span className="text-white">Stellar Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tx Hash</span>
              <span className="text-green-400 font-mono text-xs">{txHash.slice(0, 16)}...</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/chat")} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <h1 className="text-xl font-bold">
            <span className="text-white">Flow</span>
            <span className="text-violet-500">Sell</span>
            <span className="text-zinc-500 font-normal ml-2">/ Confirmar pago</span>
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Order Summary */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              Resumen de orden
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Producto</span>
                <span className="text-white font-medium">{productName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Cantidad</span>
                <span className="text-white">1</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Total</span>
                <span className="text-violet-400 font-bold text-xl">${amount} USDC</span>
              </div>

              <div className="flex gap-2 mt-4">
                <span className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1.5 rounded-full border border-blue-500/20">
                  Stellar Testnet
                </span>
                <span className="bg-violet-500/10 text-violet-400 text-xs px-3 py-1.5 rounded-full border border-violet-500/20">
                  x402 Protocol
                </span>
              </div>
            </div>
          </div>

          {/* Right: Payment Instructions */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Instrucciones de pago</h2>

            <div className="space-y-4">
              {/* Merchant Address */}
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Dirección del comerciante</label>
                <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-3">
                  <code className="text-xs text-zinc-300 flex-1 break-all font-mono">{MERCHANT_ADDRESS}</code>
                  <button
                    onClick={() => copyToClipboard(MERCHANT_ADDRESS, "address")}
                    className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied === "address" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Monto</label>
                <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-3">
                  <code className="text-sm text-violet-400 flex-1 font-mono font-bold">{amount} USDC</code>
                  <button
                    onClick={() => copyToClipboard(amount, "amount")}
                    className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied === "amount" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Memo (ID de orden)</label>
                <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-3">
                  <code className="text-xs text-zinc-300 flex-1 font-mono">{memo || "Cargando..."}</code>
                  <button
                    onClick={() => copyToClipboard(memo, "memo")}
                    className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied === "memo" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
              </div>

              {/* Stellar Expert Link */}
              <a
                href="https://laboratory.stellar.org/#account-creator?network=test"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir Stellar Laboratory (Testnet)
              </a>

              {/* Freighter Wallet */}
              <div className="pt-2">
                <p className="text-xs text-zinc-500 mb-2 font-medium">O paga directo con tu wallet:</p>
                <StellarWallet
                  amount={amount}
                  destination={MERCHANT_ADDRESS}
                  memo={memo}
                  onPaymentSent={(hash) => {
                    setTxHash(hash);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Verify Payment */}
        <div className="mt-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Verificar pago</h2>
          <p className="text-zinc-500 text-sm mb-4">
            Después de enviar el pago, pega el hash de la transacción aquí para verificar.
          </p>
          <div className="flex gap-3">
            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Pega el hash de la transacción (ej: abc123def456...)"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none text-sm font-mono"
            />
            <button
              onClick={handleVerify}
              disabled={!txHash.trim() || verifying}
              className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              {verifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Verificar pago
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
