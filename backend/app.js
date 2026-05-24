import express from 'express';
import { configDotenv } from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from "./routes/userRoute.js";
import invitationRoutes from "./routes/invitationRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import groupRoutes from "./routes/groupRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
configDotenv();

const app = express();
const PORT = process.env.PORT || 3200


app.use(cors());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }))


app.use("/api/auth" , authRoutes);
app.use("/api/users" , userRoutes);
app.use("/api/invitation" , invitationRoutes);
app.use("/api/chats" , chatRoutes);
app.use("/api/groups" , groupRoutes);
app.use("/api/message" , messageRoutes);
app.use("/api/notification" , notificationRoutes);

connectDB();

export default app;

