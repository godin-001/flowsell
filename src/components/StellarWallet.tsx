"use client";

import { useState, useEffect } from "react";
import { Wallet, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

interface WalletState {
  connected: boolean;
  publicKey: string | null;
  network: string | null;
}

interface StellarWalletProps {
  amount: string;
  destination: string;
  memo: string;
  onPaymentSent?: (txHash: string) => void;
}

export function StellarWallet({ amount, destination, memo, onPaymentSent }: StellarWalletProps) {
  const [wallet, setWallet] = useState<WalletState>({ connected: false, publicKey: null, network: null });
  const [hasFreighter, setHasFreighter] = useState<boolean | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Detectar si Freighter está instalado
    const check = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setHasFreighter(!!(window as any).freighter || !!(window as any).freighterApi);
    }, 500);
    return () => clearTimeout(check);
  }, []);

  const connectWallet = async () => {
    setConnecting(true);
    setError("");
    try {
      const { isConnected, requestAccess, getAddress, getNetwork } = await import("@stellar/freighter-api");
      const connectedResult = await isConnected();
      if (!connectedResult.isConnected) {
        setError("Freighter no detectado. Instala la extensión primero.");
        return;
      }
      // Solicitar acceso
      await requestAccess();
      const addressResult = await getAddress();
      const networkResult = await getNetwork();
      if (addressResult.error) throw new Error(addressResult.error);
      setWallet({
        connected: true,
        publicKey: addressResult.address,
        network: networkResult.network || "testnet",
      });
    } catch (e) {
      setError("Error conectando Freighter: " + (e as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  const sendPayment = async () => {
    if (!wallet.publicKey) return;
    setSending(true);
    setError("");
    try {
      // Construir la transacción en Stellar testnet
      const horizonUrl = "https://horizon-testnet.stellar.org";

      // Obtener cuenta del sender
      const accountRes = await fetch(`${horizonUrl}/accounts/${wallet.publicKey}`);
      if (!accountRes.ok) throw new Error("Cuenta no encontrada en testnet. ¿Fondeaste con Friendbot?");
      const account = await accountRes.json();
      const sequence = account.sequence;

      // Construir tx via Stellar SDK (sin instalar, usando XDR manual con fetch)
      // Para el demo, usamos el Transaction Builder de laboratory
      const labUrl = `https://laboratory.stellar.org/#txbuilder?params=${encodeURIComponent(JSON.stringify({
        sourceAccount: wallet.publicKey,
        sequence: String(BigInt(sequence) + 1n),
        fee: "100",
        memo: { type: "text", content: memo },
        operations: [{
          id: 0,
          attributes: {
            destination,
            startingBalance: amount,
            asset: { type: "native" }
          },
          name: "payment"
        }]
      }))}&network=test`;

      // Abrir Stellar Laboratory con la tx pre-llenada
      window.open(labUrl, "_blank");

      // Alternativa: mostrar instrucciones para el demo
      setError("");
      setTxHash("DEMO_TX_" + Date.now());

    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const confirmWithHash = () => {
    if (txHash && onPaymentSent) {
      onPaymentSent(txHash);
    }
  };

  // No hay Freighter instalado
  if (hasFreighter === false) {
    return (
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Wallet className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Conecta tu wallet Stellar</p>
            <p className="text-xs text-zinc-500">Necesitas la extensión Freighter</p>
          </div>
        </div>

        <div className="space-y-2">
          <a
            href="https://freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Instalar Freighter (gratis)
          </a>
          <p className="text-xs text-zinc-600 text-center">
            Es la wallet oficial de Stellar — como MetaMask pero para XLM/USDC
          </p>
        </div>

        <div className="border-t border-zinc-700 pt-4">
          <p className="text-xs text-zinc-500 mb-2">¿Ya tienes un txHash? Pégalo aquí:</p>
          <div className="flex gap-2">
            <input
              value={txHash}
              onChange={e => setTxHash(e.target.value)}
              placeholder="abc123def456..."
              className="flex-1 bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              onClick={confirmWithHash}
              disabled={!txHash.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              ✓
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Freighter instalado pero no conectado
  if (!wallet.connected) {
    return (
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <Wallet className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Wallet Stellar detectada</p>
            <p className="text-xs text-zinc-500">Conecta Freighter para pagar</p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          onClick={connectWallet}
          disabled={connecting}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
          {connecting ? "Conectando..." : "Conectar Freighter"}
        </button>
      </div>
    );
  }

  // Wallet conectada
  return (
    <div className="bg-zinc-800/50 border border-green-500/20 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">Wallet conectada</p>
          <p className="text-xs text-zinc-400 font-mono truncate">{wallet.publicKey}</p>
        </div>
        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full flex-shrink-0">
          {wallet.network || "testnet"}
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="bg-zinc-700/50 rounded-lg p-3 space-y-1 text-sm">
        <div className="flex justify-between text-zinc-400">
          <span>Monto</span>
          <span className="text-violet-400 font-bold">{amount} USDC</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Memo</span>
          <span className="font-mono text-xs text-zinc-300">{memo.slice(0, 20)}...</span>
        </div>
      </div>

      <button
        onClick={sendPayment}
        disabled={sending}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
        {sending ? "Abriendo Stellar Laboratory..." : `Pagar ${amount} USDC`}
      </button>

      <p className="text-xs text-zinc-600 text-center">
        Se abrirá Stellar Laboratory con la transacción pre-llenada
      </p>
    </div>
  );
}
