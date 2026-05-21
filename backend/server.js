import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import User from "./models/User.js";

const server = http.createServer(app);

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

  socket.on("join", (userId) => {
    socket.join(userId);

    onlineUsers.set(userId, socket.id);

    console.log(`User ${userId} joined room`);

    io.emit("userOnline", Array.from(onlineUsers.keys()));
  });

  socket.on("sendMessage", (data) => {
    const { receiverId, message } = data;

    console.log(" Message via socket:", data);

    io.to(receiverId).emit("receiveMessage", message);
  });

  socket.on("join", async (userId) => {
  socket.join(userId);
  onlineUsers.set(userId, socket.id);
  await User.findByIdAndUpdate(userId, { isOnline: true });
  io.emit("userOnline", Array.from(onlineUsers.keys()));
});

socket.on("disconnect", async () => {
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
});
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});