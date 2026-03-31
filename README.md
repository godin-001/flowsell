# FlowSell 🛍️

> **Multi-agent commerce para emprendedores LATAM — powered by Stellar x402**

**Tagline:** Ordena y vende sin esfuerzo

Submitted to: [Stellar Agents Hackathon — DoraHacks 2025](https://dorahacks.io)

---

## El problema

Todo emprendedor en LATAM vende por WhatsApp. Gestionar clientes, catálogo y pagos consume horas y es caótico. FlowSell automatiza todo con **agentes IA especializados** que trabajan en paralelo — nunca se saturan, nunca duermen.

---

## Arquitectura de agentes

```
Cliente escribe un mensaje
        │
        ▼
┌───────────────────┐
│  Phase Detector   │  ← detecta en qué etapa del embudo está el cliente
└────────┬──────────┘
         │
    ┌────┴────────────────────┐
    │                         │
    ▼                         ▼                         ▼
┌──────────┐          ┌──────────────┐          ┌──────────────┐
│ Agente 1 │          │   Agente 2   │          │   Agente 3   │
│Informador│          │   Catálogo   │          │   Checkout   │
│          │          │              │          │              │
│ Responde │          │ Recomienda   │          │ Procesa pago │
│ preguntas│          │ productos    │          │ vía Stellar  │
│ generales│          │ según interés│          │ x402 USDC    │
└──────────┘          └──────────────┘          └──────────────┘
         │                    │                         │
         └────────────────────┴─────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Neon Postgres  │
                    │  (persistencia)  │
                    └──────────────────┘
```

### Flujo de detección de fase

| Fase | Agente activo | Trigger |
|------|--------------|---------|
| `inquiry` | Informador | Inicio de conversación |
| `browsing` | Catálogo | Cliente pregunta por productos |
| `checkout` | Checkout | Cliente quiere comprar |
| `completed` | — | Pago confirmado |

---

## Stellar x402

El protocolo **x402** permite que los agentes transaccionen directamente sin cuentas de usuario ni suscripciones. FlowSell implementa:

1. **Payment Request** — el Agente Checkout genera una solicitud de pago con dirección, monto (USDC) y memo único por orden
2. **Stellar Testnet** — pagos en USDC via red Stellar testnet
3. **Verificación real** — el backend consulta Horizon API para verificar el txHash en la blockchain
4. **Confirmación automática** — la orden se marca como `paid` y el emprendedor recibe notificación

```
Agente Checkout                 Stellar Testnet
      │                               │
      │── genera PaymentRequest ──►  │
      │   (dirección + monto USDC)    │
      │                               │
      │◄── cliente envía USDC ───────│
      │                               │
      │── verifica txHash ──────────► Horizon API
      │◄── confirmed ────────────────│
      │
      │── actualiza orden → "paid"
      │── notifica emprendedor
```

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 + Tailwind CSS |
| Agentes IA | OpenRouter → GPT-4o-mini |
| Pagos | Stellar Testnet + x402 (USDC) |
| Base de datos | Neon Postgres (serverless) |
| Deploy | Vercel |

---

## 3 pantallas del demo

### 1. Setup del emprendedor (`/setup`)
CRUD completo de productos — nombre, precio, descripción, stock, categoría.

### 2. Chat con agentes (`/chat`)
El cliente chatea y los agentes correctos responden automáticamente según la fase de la conversación.

### 3. Confirmación de pago (`/confirm`)
Flujo Stellar x402 — dirección del comerciante, monto USDC, memo de orden, verificación via Horizon API.

---

## Modelo de negocio

| Plan | Precio | Límites |
|------|--------|---------|
| Free | $0 | 1 agente, 50 chats/mes, 5 productos |
| Pro | $9/mes | 3 agentes, pagos Stellar, catálogo ilimitado |
| Empresario | $50/mes | Todo automático + WhatsApp + reportes |

**Comisión:** 0.5% por cada venta procesada via Stellar.

---

## Cómo correrlo localmente

### 1. Clonar el repo
```bash
git clone https://github.com/godin-001/flowsell.git
cd flowsell
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.local.example .env.local
```

Edita `.env.local`:
```
DATABASE_URL=postgresql://...  # Neon Postgres connection string
OPENROUTER_API_KEY=sk-or-...   # OpenRouter API key
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

### 3. Crear tablas en la BD
```bash
node scripts/migrate.js
```

### 4. Correr el servidor
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Links

- 🌐 **Demo:** https://flowsell.vercel.app
- 🔗 **GitHub:** https://github.com/godin-001/flowsell
- 🏆 **Hackathon:** [Stellar Agents Hackathon — DoraHacks](https://dorahacks.io)

---

## Equipo

Construido con ❤️ para el Stellar Agents Hackathon 2025.
