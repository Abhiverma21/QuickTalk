import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Invitation from "../models/Invitation.js";

export const createGroup = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { groupName, participantIds } = req.body;

    if (!groupName || !participantIds || !Array.isArray(participantIds) || participantIds.length < 1) {
      return res.status(400).json({ message: "Group name and at least 1 participant required" });
    }

    const users = await User.find({ _id: { $in: participantIds } });
    if (users.length !== participantIds.length) {
      return res.status(404).json({ message: "Some users not found" });
    }

    for (const pid of participantIds) {
      const connected = await Invitation.findOne({
        $or: [
          { sender: currentUserId, receiver: pid, status: "accepted" },
          { sender: pid, receiver: currentUserId, status: "accepted" },
        ],
      });
      if (!connected) {
        return res.status(403).json({ message: "All participants must be connected (accepted invitation)" });
      }
    }

    const allParticipants = [currentUserId, ...participantIds];

    const chat = await Chat.create({
      participants: allParticipants,
      isGroupChat: true,
      groupName,
      groupAdmin: currentUserId,
    });

    const populated = await Chat.findById(chat._id).populate("participants", "-password").populate("groupAdmin", "name");

    return res.status(201).json({ chat: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { id } = req.params;

    const chat = await Chat.findById(id);
    if (!chat || !chat.isGroupChat) return res.status(404).json({ message: "Group not found" });

    if (chat.groupAdmin.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Only group admin can delete the group" });
    }

    await Chat.findByIdAndDelete(id);
    return res.status(200).json({ message: "Group deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addUserToGroup = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { id } = req.params; 
    const { userId } = req.body; 

    const chat = await Chat.findById(id);
    if (!chat || !chat.isGroupChat) return res.status(404).json({ message: "Group not found" });

    if (chat.groupAdmin.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Only group admin can add members" });
    }

    if (chat.participants.map(p => p.toString()).includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const connected = await Invitation.findOne({
      $or: [
        { sender: currentUserId, receiver: userId, status: "accepted" },
        { sender: userId, receiver: currentUserId, status: "accepted" },
      ],
    });
    if (!connected) return res.status(403).json({ message: "User is not connected" });

    chat.participants.push(userId);
    await chat.save();

    const updated = await Chat.findById(id).populate("participants", "-password").populate("groupAdmin", "name");
    return res.status(200).json({ chat: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeUserFromGroup = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { id } = req.params; 
    const { userId } = req.body; 

    const chat = await Chat.findById(id);
    if (!chat || !chat.isGroupChat) return res.status(404).json({ message: "Group not found" });

    const isSelf = userId === currentUserId.toString();
    const isAdmin = chat.groupAdmin.toString() === currentUserId.toString();
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Only group admin can remove others" });
    }

    if (!chat.participants.map(p => p.toString()).includes(userId)) {
      return res.status(400).json({ message: "User not in group" });
    }

    chat.participants = chat.participants.filter(p => p.toString() !== userId);
    if (isSelf && isAdmin) {
      chat.groupAdmin = chat.participants.length ? chat.participants[0] : null;
    }

    await chat.save();
    const updated = await Chat.findById(id).populate("participants", "-password").populate("groupAdmin", "name");
    return res.status(200).json({ chat: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const groups = await Chat.find({ participants: currentUserId, isGroupChat: true })
      .populate("participants", "name email")
      .populate("groupAdmin", "name email")
      .populate({ path: "lastMessage", populate: { path: "sender", select: "name" } })
      .sort({ updatedAt: -1 });

    return res.status(200).json({ groups });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
