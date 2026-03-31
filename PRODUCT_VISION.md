# FlowSell — Visión de Producto Completa

> Guardado: 2026-03-31 | Autor: eelien

---

## La idea central

FlowSell es una plataforma de comercio multi-agente para emprendedores en LATAM.
Automatiza ventas, publicidad y entregas usando IA — sin que el emprendedor tenga que
estar pegado al teléfono.

**"Ordena y vende sin esfuerzo"**

---

## Fase 1 — Hackathon (deadline 13 abril 2026)

Stellar Agents Hackathon (DoraHacks)
- Stack: Next.js + Neon + OpenRouter + Stellar x402 USDC
- Demo live: https://flowsell-chi.vercel.app
- Repo: https://github.com/godin-001/flowsell

### Agentes del demo:
- ✅ Agente Informador — responde preguntas generales
- ✅ Agente Catálogo — recomienda productos según interés
- ✅ Agente Checkout — procesa pagos USDC via Stellar testnet
- 🔲 Agente Publicidad — (roadmap en el demo, construir después)

---

## Fase 2 — Producto real (post-hackathon)

### Objetivo
Que cualquier emprendedor en México, LATAM o el mundo pueda usarlo.
No requiere conocimientos técnicos. Solo conecta su catálogo y listo.

### Stack adicional necesario:
- **Pagos fiat:** Stripe (tarjetas Visa/MC) + MercadoPago (OXXO, transferencia MX)
- **WhatsApp:** Twilio WhatsApp Business API
- **Envíos:** MercadoLibre API + Envíame + Estafeta/FedEx/DHL
- **Redes sociales:** Meta Graph API (Facebook + Instagram)
- **Scheduler:** Vercel Cron Jobs

---

## Agentes completos (visión final)

### Agente 1 — Informador ✅
Responde preguntas generales del negocio.

### Agente 2 — Catálogo ✅
Recomienda productos personalizados según el interés del cliente.

### Agente 3 — Checkout ✅
Gestiona la compra. Pago via Stellar (crypto) o Stripe/MercadoPago (tarjeta).

### Agente 4 — Publicidad 🔲
- Genera copy del post automáticamente con IA
- Genera imagen del producto con IA (DALL-E / Stable Diffusion)
- Publica en Facebook e Instagram automáticamente
- El emprendedor programa: diario, cada 2 días, semanal, etc.
- Incluye link de compra por WhatsApp en cada post

### Agente 5 — Entregas 🔲
- Conecta con MercadoLibre si el emprendedor ya tiene cuenta
- Genera etiqueta de envío automáticamente al confirmar compra
- Notifica al cliente el tracking por WhatsApp
- Integración: MercadoLibre / Estafeta / DHL / Envíame / Rappi

---

## Modelo de negocio

### Planes de suscripción

| Plan | Precio | Qué incluye |
|------|--------|-------------|
| **Free** | $0/mes | 1 agente, 50 chats/mes, 5 productos, 1 post/semana automático |
| **Pro** | $9/mes | 3 agentes, pagos (Stripe+MercadoPago), catálogo ilimitado, programación de posts a elección |
| **Empresario** | $50/mes | Todo automático + WhatsApp + reportes + agente entregas + soporte prioritario |

### Ingresos adicionales
- **Comisión 0.5%** por cada venta procesada via la plataforma
- **$0.10** por envío gestionado (cuando usan el agente de entregas)

### Proyección
```
1,000 usuarios Pro × $9    = $9,000/mes
100 usuarios Empresario × $50 = $5,000/mes
10,000 ventas/mes × $50 avg × 0.5% = $2,500/mes
────────────────────────────────────
Total aprox año 1:          ~$16,500/mes
```

---

## Diferencial vs competencia

| | FlowSell | Shopify | MercadoLibre |
|---|---|---|---|
| Agentes IA especializados | ✅ | ❌ | ❌ |
| Ventas por WhatsApp | ✅ | ❌ | ❌ |
| Publicidad automática | ✅ | Plugin $$ | ❌ |
| Pagos cripto x402 | ✅ | Plugin $$ | ❌ |
| Para emprendedores LATAM | ✅ | Parcial | ✅ |
| Sin conocimientos técnicos | ✅ | Parcial | ✅ |

---

## Roadmap

### Q2 2026 (ahora)
- [x] Demo hackathon funcionando
- [x] Deploy en Vercel
- [ ] Agente Publicidad básico
- [ ] WhatsApp via Twilio

### Q3 2026
- [ ] Stripe + MercadoPago
- [ ] Agente Entregas (MercadoLibre + Estafeta)
- [ ] Lanzamiento beta México

### Q4 2026
- [ ] WhatsApp Business API completo
- [ ] Panel de analytics para emprendedores
- [ ] Expansión Colombia, Argentina, Chile

---

## Notas del fundador

- La versión cripto (Stellar) y la versión fiat (Stripe) van en el mismo repo
  con configuración por región — no son productos separados
- El emprendedor no necesita saber nada de cripto ni de código
- El foco inicial es México porque tiene 4M+ emprendedores que venden por WhatsApp
