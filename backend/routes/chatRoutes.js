import express from 'express';

import { createOrGetPrivateChat, getMyChats, deleteChat } from '../controllers/chatController.js';
import { protect } from '../middleware/protect.js';
const router = express.Router();

router.post("/create",protect,createOrGetPrivateChat);
router.get("/mychat",protect,getMyChats);
router.delete("/:id", protect, deleteChat);


export default router;  