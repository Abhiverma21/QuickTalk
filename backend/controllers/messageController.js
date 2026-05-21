import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { io } from "../server.js";
import cloudinary from "../config/cloudinaryConfig.js";

export const sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { chatId } = req.body;
    let { content } = req.body;

    if (!chatId || (!content && !req.file)) {
      return res.status(400).json({ message: "Missing fields" });
    }

    let attachment = null;
    if (req.file) {
      const fileData = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      try {
        const result = await cloudinary.uploader.upload(fileData, {
          folder: "chatapp/messages",
        });
        const url = result.secure_url;
        attachment = { url, mimetype: req.file.mimetype };
      } catch (e) {
        console.error("Cloudinary upload failed", e);
      }
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messagePayload = {
      sender: currentUserId,
      chat: chatId,
      content: content || "",
      status: "sent",
    };

    if (attachment) messagePayload.attachment = attachment;

    const message = await Message.create(messagePayload);

    //  update last message
    chat.lastMessage = message._id;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "-password");

    //SOCKET EMIT
    const receiver = chat.participants.find(
      (p) => p.toString() !== currentUserId.toString()
    );

    io.to(currentUserId.toString()).emit("receiveMessage", populatedMessage);

    if (receiver) {
      io.to(receiver.toString()).emit("receiveMessage", populatedMessage);
    }

    return res.status(201).json(populatedMessage);

  } catch (err) {
    console.error(" ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getMessagesByChatId = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isParticipant = chat.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant of this chat" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "-password")
      .sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err)
    return res.status(500).json({ message: err.message || "Failed to fetch messages" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    if (message.isDeleted) {
      return res.status(400).json({ message: "Cannot edit a deleted message" });
    }

    message.content = content.trim();
    message.editedAt = new Date();
    await message.save();
    
    const updatedMessage = await Message.findById(id)
    .populate("sender", "-password")
    .populate("chat");
    
    // Emit to all chat participants
    const chat = await Chat.findById(message.chat);
    if (chat && chat.participants) {
      chat.participants.forEach(participantId => {
        io.to(participantId.toString()).emit("messageUpdated", updatedMessage);
      });
    }

    return res.status(200).json({ message: updatedMessage });
  } catch (err) {
    console.error("Error editing message:", err);
    return res.status(500).json({ message: err.message || "Failed to edit message" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    message.content = "This message was deleted";
    message.isDeleted = true;
    await message.save();
    
    const deletedMessage = await Message.findById(id)
    .populate("sender", "-password")
    .populate("chat");
    
    // Emit to all chat participants
    const chat = await Chat.findById(message.chat);
    if (chat && chat.participants) {
      chat.participants.forEach(participantId => {
        io.to(participantId.toString()).emit("messageDeleted", deletedMessage);
      });
    }
    
    return res.status(200).json({ message: deletedMessage });
  } catch (err) {
    console.error("Error deleting message:", err);
    return res.status(500).json({ message: err.message || "Failed to delete message" });
  }
};