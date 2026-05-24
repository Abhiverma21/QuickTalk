import http from "http";
import { Server } from "socket.io";
import { configDotenv } from "dotenv";
configDotenv();
import app from "./app.js";
import User from "./models/User.js";
import { configDotenv } from "dotenv";
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const onlineUsers = new Map();
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("join", async (userId) => {
    try {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} joined`);
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
      });
      io.emit("userOnline", Array.from(onlineUsers.keys()));
    } catch (error) {
      console.log("Join Error:", error.message);
    }
  });
  socket.on("sendMessage", async (data) => {
    try {
      const { receiverId, senderId, message } = data;
      console.log("Message via socket:", data);
      io.to(receiverId).emit("receiveMessage", message);
    } catch (error) {
      console.log("Send Message Error:", error.message);
    }
  });
  socket.on("disconnect", async () => {
    try {
      console.log("User disconnected:", socket.id);
      for (let [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("userOnline", Array.from(onlineUsers.keys()));
    } catch (error) {
      console.log("Disconnect Error:", error.message);
    }
  });
});
server.listen(PORT, () => {
  console.log("Server running on port " , PORT);
});
