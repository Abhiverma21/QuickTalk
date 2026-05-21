    import User from "../models/User.js";
    import Chat from "../models/Chat.js";
    import Invitation from "../models/Invitation.js";

    export const createOrGetPrivateChat = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { receiverId } = req.body;

        if (!receiverId) {
        return res.status(400).json({ message: "Receiver ID is required" });
        }

        if (currentUserId.toString() === receiverId) {
        return res.status(400).json({ message: "You cannot chat with yourself" });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
        return res.status(404).json({ message: "User not found" });
        }

        const connection = await Invitation.findOne({
        $or: [
            { sender: currentUserId, receiver: receiverId, status: "accepted" },
            { sender: receiverId, receiver: currentUserId, status: "accepted" },
        ],
        });

        if (!connection) {
        return res.status(403).json({ message: "You are not connected with this user" });
        }
        let chat = await Chat.findOne({
        isGroupChat: false,
        participants: {
            $all: [currentUserId, receiverId],
            $size: 2,
        },
        })
        .populate("participants", "-password")
        .populate("lastMessage");

        if (chat) {
        return res.status(200).json({ chat });
        }

        chat = await Chat.create({
        participants: [currentUserId, receiverId],
        isGroupChat: false,
        });

        chat = await Chat.findById(chat._id)
        .populate("participants", "-password")
        .populate("lastMessage");

        return res.status(201).json({ chat });

    } catch (err) {
        console.error("Error creating chat:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
    };

    export const getMyChats = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const chats = await Chat.find({
      participants: currentUserId,
      isGroupChat: false,
    })
      .populate("participants", "name email lastSeen profilePic")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name",
        },
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json({ chats });

  } catch (err) {
    console.error("Error fetching chats:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createGroupChat = async(req,res)=>{
   const { groupName, participants } = req.body;
}