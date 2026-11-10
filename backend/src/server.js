

import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import app from "./app.js";
import { setIO } from "./config/socket.js";
import { seedInitialCatalogIfEmpty } from "./config/seedDemo.js";

dotenv.config();

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bangelsverse";

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
            : "*",
    },
});
setIO(io);

io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;
    if (token && process.env.JWT_SECRET) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded?.id) {
                socket.join(`user:${decoded.id}`);
                if (decoded.role === "owner") {
                    socket.join(`owner:${decoded.id}`);
                }
                if (decoded.role === "admin") {
                    socket.join("admin");
                }
            }
        } catch {
            // Unauthenticated sockets stay out of private rooms
        }
    }

    socket.on("joinConversation", (conversationId) => {
        if (conversationId) socket.join(conversationId);
    });

    socket.on("sendMessage", ({ conversationId, message }) => {
        if (conversationId && message) {
            socket.to(conversationId).emit("receiveMessage", message);
        }
    });

    socket.on("disconnect", () => {});
});

const connectWithFallback = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
        });
        console.log("MongoDB connected");
    } catch (err) {
        const isDev = process.env.NODE_ENV !== "production";
        const isAtlasDnsFail = /querySrv|ENOTFOUND|EAI_AGAIN/i.test(err.message);
        const localFallback = "mongodb://127.0.0.1:27017/bangelsverse";

        if (isDev && isAtlasDnsFail && MONGO_URI !== localFallback) {
            console.warn(
                `Atlas MongoDB unreachable (${err.message}). Falling back to local MongoDB: ${localFallback}`
            );
            await mongoose.connect(localFallback, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log("Local MongoDB connected");
            return;
        }
        throw err;
    }
};

const startServer = async () => {
    try {
        await connectWithFallback();

        if (process.env.AUTO_SEED !== "false") {
            await seedInitialCatalogIfEmpty();
        }

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err.message);
        console.error(
            "Tip: Update MONGO_URI in backend/.env or start local MongoDB on 127.0.0.1:27017."
        );
        process.exit(1);
    }
};

const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
    });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
