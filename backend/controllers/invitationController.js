import Invitation from "../models/Invitation.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import { io } from "../server.js";

// helper → ALWAYS return populated invitation
const getPopulatedInvitation = async (id) => {
  return await Invitation.findById(id)
    .populate("sender", "name email")
    .populate("receiver", "name email");
};

export const sendInvitation = async (req, res) => {
  try {
    const sender = req.user._id;
    const { receivers } = req.body;

    if (!receivers || receivers.length === 0) {
      return res.status(400).json({ message: "Receivers are required" });
    }

    const invitations = [];

    for (let receiver of receivers) {
      if (sender.toString() === receiver) continue;

      const existing = await Invitation.findOne({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      }).sort({ createdAt: -1 });

      if (existing) {
        if (existing.status === "pending") {
          return res.status(400).json({ message: "Invitation already pending" });
        }

        if (existing.status === "accepted") {
          return res.status(400).json({ message: "You are already friends" });
        }

        if (existing.status === "rejected") {
          const now = new Date();
          const diffHours = (now - existing.updatedAt) / (1000 * 60 * 60);

          if (diffHours < 24) {
            return res.status(400).json({
              message: "You can send invitation after 24 hours",
            });
          }
        }
      }

      const invitation = await Invitation.create({
        sender,
        receiver,
        status: "pending",
      });

      const populatedInvitation = await getPopulatedInvitation(invitation._id);

      io.to(receiver.toString()).emit("newInvitation", populatedInvitation);

      invitations.push(populatedInvitation);
    }

    return res.status(201).json({
      message: "Invitation sent successfully",
      invitations,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation already processed" });
    }

    invitation.status = "accepted";
    await invitation.save();

    const senderId = invitation.sender;
    const receiverId = invitation.receiver;

    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: {
        $all: [senderId, receiverId],
        $size: 2,
      },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiverId],
        isGroupChat: false,
      });
    }

    const populatedInvitation = await getPopulatedInvitation(invitation._id);

    io.to(senderId.toString()).emit("invitationAccepted", populatedInvitation);
    io.to(receiverId.toString()).emit("invitationAccepted", populatedInvitation);
    io.to(receiverId.toString()).emit("newChat", chat);

    return res.status(200).json({
      message: "Invitation accepted",
      chat,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const rejectInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation already processed" });
    }

    invitation.status = "rejected";
    invitation.rejectedAt = new Date();

    await invitation.save();

    const populatedInvitation = await getPopulatedInvitation(invitation._id);

    io.to(invitation.sender.toString()).emit(
      "invitationRejected",
      populatedInvitation
    );

    io.to(invitation.receiver.toString()).emit(
      "invitationRejected",
      populatedInvitation
    );

    return res.status(200).json({
      message: "Invitation rejected",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMyInvitations = async (req, res) => {
  try {
    const userId = req.user._id;

    const invitations = await Invitation.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    const sent = [];
    const received = [];

    invitations.forEach((inv) => {
      if (inv.sender._id.toString() === userId.toString()) {
        sent.push(inv);
      } else {
        received.push(inv);
      }
    });

    return res.status(200).json({
      success: true,
      sent,
      received,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};