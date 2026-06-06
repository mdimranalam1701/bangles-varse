import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

import http from "http";
import { Server } from "socket.io";

dotenv.config();

const PORT = process.env.PORT || 5002;

// create http server
const server = http.createServer(app);

// socket server
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch((err) => {
    console.error(err.message);
  });