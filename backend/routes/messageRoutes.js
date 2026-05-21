import express from 'express';

import { sendMessage, getMessagesByChatId, editMessage, deleteMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/protect.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post("/send", protect, upload.single('file'), sendMessage);
router.put("/:id", protect, editMessage);
router.delete("/:id", protect, deleteMessage);
router.get("/:chatId", protect, getMessagesByChatId);

export default router;