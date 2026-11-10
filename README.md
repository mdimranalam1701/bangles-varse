# Bangels Verse — Handcrafted Heritage Bangles Marketplace

A production-ready full-stack MERN marketplace crafted for Indian handcrafted bangles (Jaipur Kundan, Lac, 22K Gold-Plated, Firozabad Glass, Bridal Chooda, Silver Kada, and Everyday Rose Gold) — built specifically so **first-time and non-tech-savvy mobile buyers** can place orders in under 30 seconds.

## Key Capabilities

### For End Customers (Zero Friction)
- **1-Tap Quick Order (No Login Required):** Order any bangle using just **Name**, **10-digit Mobile Number**, and **Delivery Address** — no email or password barrier.
- **Bilingual Experience (`English` / `हिन्दी`):** Instant 1-tap toggle across the entire storefront, bangle sizes, checkout, and order tracking.
- **Visual Bangle Size Guide:** Interactive ruler diagram & diameter table (`2.2` to `2.10` in cm & inches).
- **Zero-Login Order Tracking (`/track-order`):** Check live order status (`Received → Confirmed → Packed → Shipped → Delivered`) using a 10-digit phone number or `BV-XXXX` order code.
- **WhatsApp & Direct Call Ordering:** Pre-filled WhatsApp order messages and click-to-call fallback on every product.
- **Customer Khata (Udhaar Ledger):** Repeat local buyers can buy on trusted shop credit and track repayment history.

### For Shop Owners & Platform Admins
- **Owner Dashboard (`/owner/dashboard`):** Live Socket.IO order alerts, 7-day sales chart, low-stock alerts, bilingual catalog manager, 1-click order status progression, and customer Khata cash settlement.
- **Admin Control Panel (`/admin/dashboard`):** Shop owner approval workflow, platform GMV analytics, user/order/transaction oversight.

### Security, Reliability & Performance
- **Backend Hardening:** `helmet`, `compression`, `express-rate-limit`, `zod` boundary validation, structured error handling, CORS allowlist, and `/api/health`.
- **Order Integrity:** Atomic stock reservation (`$gte` + rollback), `Idempotency-Key` protection against duplicate orders, multi-owner revenue/notification attribution.
- **Frontend Performance:** Route-level code splitting (`React.lazy`), debounced search, skeleton loading, optimized vector/studio assets.

## Quick Start

```bash
# 1. Install dependencies
npm run install:all

# 2. Configure backend/.env (see backend/.env.example)
# 3. Build frontend & run tests
npm run build
npm test

# 4. Run development servers
npm run dev:backend
npm run dev:frontend
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for single-server cloud deployment (Render/Railway), split hosting (Vercel + Render), and Docker Compose instructions.

