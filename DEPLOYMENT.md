# Bangels Verse — Production Deployment Guide

Bangels Verse supports **3 deployment modes** out of the box.

---

## Option 1: Single-Server Cloud Deploy (Render / Railway / VPS) — Easiest
The Express backend serves `/api/*`, `/uploads/*`, and the built Vite frontend (`frontend/dist`) on a single origin with zero CORS headaches.

1. Set environment variables (copy from `backend/.env.example`):
   - `NODE_ENV=production`
   - `SERVE_FRONTEND=true`
   - `MONGO_URI=<your MongoDB Atlas or self-hosted URI>`
   - `JWT_SECRET=<strong 64+ char random string>`
   - `SUPPORT_PHONE=9876543210`
   - `SUPPORT_WHATSAPP=919876543210`
   - Optional: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_*`
2. Build & start:
   ```bash
   npm run install:all
   npm run build
   npm start
   ```
   - Or simply connect the repo to **Render** using the included `render.yaml` Blueprint.
3. Verify health check: `GET /api/health` returns `200 OK` with `"db": "connected"`.

---

## Option 2: Split Hosting (Vercel Frontend + Render/Railway Backend)
1. **Deploy Backend** (`backend/`):
   - Set `SERVE_FRONTEND=false`
   - Set `CORS_ORIGIN=https://your-frontend.vercel.app`
   - Start command: `npm start`
2. **Deploy Frontend** (`frontend/`):
   - Set `VITE_API_URL=https://your-backend.onrender.com`
   - Build command: `npm run build`, Output directory: `dist`
   - `frontend/vercel.json` handles React Router SPA rewrites automatically.

---

## Option 3: Docker / VPS (`docker-compose.yml`)
Run MongoDB 8 + Bangels Verse in isolated containers:
```bash
JWT_SECRET=your_strong_secret docker compose up -d --build
```
App runs on `http://localhost:5002` (or reverse-proxy port 80/443 via Nginx/Caddy).

---

## Default Demo Accounts (Auto-seeded when database has 0 products)
- **Admin:** `admin@bangelsverse.com` / `admin123`
- **Shop Owner:** `artisan@bangelsverse.com` / `owner123` (or phone `9876543210`)
- **Customer:** `9811122233` / PIN `1234`
*(Change or rotate seeded passwords immediately before public launch.)*

