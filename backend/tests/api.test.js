import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import http from "node:http";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_key_for_bangels_verse_123456";
process.env.SERVE_FRONTEND = "false";

import app from "../src/app.js";
import { User } from "../src/modules/auth/user.model.js";
import { Product } from "../src/modules/product/product.model.js";
import { Order } from "../src/modules/order/order.model.js";
import { Cart } from "../src/modules/cart/cart.model.js";
import { Credit } from "../src/modules/credit/credit.model.js";
import { Notification } from "../src/modules/notification/notification.model.js";

const TEST_MONGO_URI = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/bangelsverse_test";

let server;
let baseUrl;
let adminToken;
let ownerToken;
let ownerId;
let userToken;
let userId;
let productId;
let quickOrderCode;

async function api(path, { method = "GET", body, token, headers = {} } = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
}

describe("Bangels Verse Backend API", () => {
    before(async () => {
        await mongoose.connect(TEST_MONGO_URI);
        await Promise.all([
            User.deleteMany({}),
            Product.deleteMany({}),
            Order.deleteMany({}),
            Cart.deleteMany({}),
            Credit.deleteMany({}),
            Notification.deleteMany({}),
        ]);

        const adminHash = await bcrypt.hash("admin123", 10);
        await User.create({
            name: "Admin",
            email: "admin@test.com",
            password: adminHash,
            role: "admin",
            isApproved: true,
        });

        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        const addr = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
    });

    after(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        await new Promise((resolve) => server.close(resolve));
    });

    it("returns health and public config", async () => {
        const health = await api("/api/health");
        assert.equal(health.status, 200);
        assert.equal(health.json.status, "ok");
        assert.equal(health.json.db, "connected");

        const cfg = await api("/api/config");
        assert.equal(cfg.status, 200);
        assert.ok(cfg.json.data.supportPhone);
    });

    it("handles auth: phone registration, email/phone login, and admin approval", async () => {
        // Admin login
        const adminRes = await api("/api/auth/login", {
            method: "POST",
            body: { identifier: "admin@test.com", password: "admin123" },
        });
        assert.equal(adminRes.status, 200);
        adminToken = adminRes.json.data.token;

        // Owner register
        const ownerReg = await api("/api/auth/register", {
            method: "POST",
            body: {
                name: "Meena Artisans",
                email: "owner@test.com",
                phone: "9876543210",
                password: "password123",
                role: "owner",
                companyName: "Jaipur Bangles House",
            },
        });
        assert.equal(ownerReg.status, 201);
        ownerToken = ownerReg.json.token;
        ownerId = ownerReg.json.user._id;

        // Unapproved owner cannot create product
        const blocked = await api("/api/products", {
            method: "POST",
            token: ownerToken,
            body: { name: "Gold Kangan", price: 1200, stock: 5, category: "Gold" },
        });
        assert.equal(blocked.status, 403);

        // Admin approves owner
        const approved = await api(`/api/admin/users/${ownerId}/approve`, {
            method: "PUT",
            token: adminToken,
        });
        assert.equal(approved.status, 200);
        assert.equal(approved.json.data.isApproved, true);

        // Phone-only customer register with 4-digit PIN
        const custReg = await api("/api/auth/register", {
            method: "POST",
            body: { name: "Kamla Devi", phone: "9822233344", password: "4321" },
        });
        assert.equal(custReg.status, 201);

        // Login with phone
        const custLogin = await api("/api/auth/login", {
            method: "POST",
            body: { identifier: "+91 9822233344", password: "4321" },
        });
        assert.equal(custLogin.status, 200);
        userToken = custLogin.json.data.token;
        userId = custLogin.json.data.user._id;
    });

    it("creates, queries, and retrieves single product with category summary", async () => {
        const created = await api("/api/products", {
            method: "POST",
            token: ownerToken,
            body: {
                name: "Royal Kundan Kada",
                nameHi: "रॉयल कुंदन कड़ा",
                price: 1500,
                compareAtPrice: 2000,
                category: "Gold",
                material: "22K Gold Plated",
                sizes: ["2.4", "2.6", "2.8"],
                stock: 10,
                isFeatured: true,
            },
        });
        assert.equal(created.status, 201);
        productId = created.json.data._id;

        const list = await api("/api/products?category=Gold&search=Kundan");
        assert.equal(list.status, 200);
        assert.equal(list.json.data.products.length, 1);

        const detail = await api(`/api/products/${productId}`);
        assert.equal(detail.status, 200);
        assert.equal(detail.json.data.name, "Royal Kundan Kada");

        const cats = await api("/api/products/categories/summary");
        assert.equal(cats.status, 200);
        assert.equal(cats.json.data[0].category, "Gold");
    });

    it("supports 1-tap quick order without login, atomic stock, idempotency, and masked tracking", async () => {
        const idemKey = "quick-idem-001";
        const quick = await api("/api/orders/quick", {
            method: "POST",
            headers: { "Idempotency-Key": idemKey },
            body: {
                customerName: "Radha Sharma",
                customerPhone: "9811199988",
                shippingAddress: { line1: "House 14, Ward 3", city: "Jaipur", pincode: "302001" },
                paymentType: "cash",
                items: [{ product: productId, quantity: 2, size: "2.6" }],
            },
        });
        assert.equal(quick.status, 201);
        assert.match(quick.json.data.orderCode, /^BV-/);
        assert.equal(quick.json.data.totalAmount, 3000);
        quickOrderCode = quick.json.data.orderCode;

        // Idempotent retry returns same order without decrementing stock twice
        const retry = await api("/api/orders/quick", {
            method: "POST",
            headers: { "Idempotency-Key": idemKey },
            body: {
                customerName: "Radha Sharma",
                customerPhone: "9811199988",
                shippingAddress: { line1: "House 14, Ward 3", city: "Jaipur", pincode: "302001" },
                paymentType: "cash",
                items: [{ product: productId, quantity: 2, size: "2.6" }],
            },
        });
        assert.equal(retry.status, 201);
        assert.equal(retry.json.data.orderCode, quickOrderCode);

        const prodAfter = await api(`/api/products/${productId}`);
        assert.equal(prodAfter.json.data.stock, 8);

        // Public track masks phone
        const tracked = await api(`/api/orders/track?code=${quickOrderCode}`);
        assert.equal(tracked.status, 200);
        assert.equal(tracked.json.data.length, 1);
        assert.equal(tracked.json.data[0].customerPhoneMasked, "******9988");
        assert.equal(tracked.json.data[0].customerPhone, undefined);
    });

    it("handles cart checkout, clears cart, records khata credit, and updates order status", async () => {
        await api("/api/cart", {
            method: "POST",
            token: userToken,
            body: { productId, quantity: 2, size: "2.4" },
        });
        await api("/api/cart", {
            method: "PATCH",
            token: userToken,
            body: { productId, quantity: 3, size: "2.4" },
        });

        const orderRes = await api("/api/orders", {
            method: "POST",
            token: userToken,
            body: {
                items: [{ product: productId, quantity: 3, size: "2.4" }],
                paymentType: "credit",
                shippingAddress: { line1: "Main Bazar", city: "Alwar" },
            },
        });
        assert.equal(orderRes.status, 201);
        const orderId = orderRes.json.data._id;

        // Cart is auto-cleared
        const cartAfter = await api("/api/cart", { token: userToken });
        assert.equal(cartAfter.json.data.items.length, 0);

        // Khata credit balance recorded accurately (3 * 1500 = 4500)
        const credits = await api("/api/credit/my", { token: userToken });
        assert.equal(credits.status, 200);
        assert.equal(credits.json.data[0].balance, 4500);

        // Owner settles partial payment
        const settled = await api("/api/credit/owner/settle", {
            method: "POST",
            token: ownerToken,
            body: { customerId: userId, amount: 1500, note: "Cash received" },
        });
        assert.equal(settled.status, 200);
        assert.equal(settled.json.data.balance, 3000);

        // Owner updates order status
        const updatedStatus = await api(`/api/orders/${orderId}/status`, {
            method: "PATCH",
            token: ownerToken,
            body: { status: "confirmed", note: "Packing bangles carefully" },
        });
        assert.equal(updatedStatus.status, 200);
        assert.equal(updatedStatus.json.data.status, "confirmed");

        // Customer cancels confirmed order -> stock restored from 5 to 8
        const cancelled = await api(`/api/orders/${orderId}/cancel`, {
            method: "PATCH",
            token: userToken,
        });
        assert.equal(cancelled.status, 200);
        assert.equal(cancelled.json.data.status, "cancelled");

        const prodRestored = await api(`/api/products/${productId}`);
        assert.equal(prodRestored.json.data.stock, 8);
    });
});

