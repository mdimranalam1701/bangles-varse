import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedAdmin } from "./utils/seedAdmin.js";
import { setIO } from "./utils/socket.js";

import http from "http";
import { Server } from "socket.io";

dotenv.config();

const PORT = process.env.PORT || 5002;

// create http server
const server = http.createServer(app);

// socket server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Share io instance globally (avoids circular dependency)
setIO(io);

// socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Chat: Join a conversation room
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Chat: Send message to conversation room
  socket.on("sendMessage", ({ conversationId, message }) => {
    socket.to(conversationId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {

    console.log("MongoDB connected");
    await seedAdmin();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch((err) => {
    console.error(err.message);
  });