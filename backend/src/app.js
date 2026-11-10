import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import orderRoutes from "./modules/order/order.route.js";
import creditRoutes from "./modules/credit/credit.route.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import transactionRoutes from "./modules/transaction/transaction.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";
import { isRazorpayConfigured } from "./config/razorpay.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

// Security & Performance headers
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false,
    })
);
app.use(compression());

// CORS allowlist
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            if (allowedOrigins.length === 0 || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
                return cb(null, true);
            }
            if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
                return cb(null, true);
            }
            return cb(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Rate limiting (skip in test mode)
if (process.env.NODE_ENV !== "test") {
    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 400,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message: "Too many requests, please try again shortly." },
    });
    const strictLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 40,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message: "Too many attempts. Please wait a few minutes." },
    });

    app.use("/api", apiLimiter);
    app.use("/api/auth/login", strictLimiter);
    app.use("/api/auth/register", strictLimiter);
    app.use("/api/orders/quick", strictLimiter);
}

// Health & Public Store Config
app.get("/api/health", (_req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    res.status(dbReady ? 200 : 503).json({
        success: true,
        status: dbReady ? "ok" : "degraded",
        db: dbReady ? "connected" : "disconnected",
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

app.get("/api/config", (_req, res) => {
    res.json({
        success: true,
        data: {
            supportPhone: process.env.SUPPORT_PHONE || "9876543210",
            supportWhatsapp: process.env.SUPPORT_WHATSAPP || "919876543210",
            razorpayEnabled: isRazorpayConfigured(),
            razorpayKeyId: isRazorpayConfigured() ? process.env.RAZORPAY_KEY_ID : "",
        },
    });
});

// Local uploads static serving
const uploadsDir = path.resolve("uploads");
app.use("/uploads", express.static(uploadsDir, { maxAge: "7d" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/credit", creditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// Unified Production Static Frontend Fallback
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");

if (process.env.SERVE_FRONTEND !== "false" && fs.existsSync(frontendIndexPath)) {
    app.use(express.static(frontendDistPath, { maxAge: "7d" }));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
            return next();
        }
        return res.sendFile(frontendIndexPath);
    });
} else {
    app.get("/", (_req, res) => {
        res.json({ success: true, message: "Bangels Verse API is running" });
    });
}

app.use("/api/*", notFoundHandler);
app.use(errorHandler);

export default app;
