import User from "../models/User.js";
import Invitation from "../models/Invitation.js";
import cloudinary from "../config/cloudinaryConfig.js";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUser = req.user._id;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Query is required" });
    }

    const regex = new RegExp(query.trim(), "i");
    const users = await User.find({
      _id: { $ne: currentUser },
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
      ],
    }).select("-password");
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getConnectedUsers = async (req, res) => {
  try {
    const currentUser = req.user._id;

    const invites = await Invitation.find({
      $or: [
        { sender: currentUser, status: "accepted" },
        { receiver: currentUser, status: "accepted" },
      ],
    });

    const ids = invites.map((inv) =>
      inv.sender.toString() === currentUser.toString() ? inv.receiver : inv.sender
    );

    const users = await User.find({ _id: { $in: ids } }).select("-password");

    return res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, profilePic } = req.body;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const update = {};
    if (name) update.name = name;

    if (req.file) {
      const imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(imageData, {
        folder: "chatapp/profiles",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });
      update.profilePic = result.secure_url;
    } else if (profilePic) {
      if (profilePic.startsWith && profilePic.startsWith("data:")) {
        const result = await cloudinary.uploader.upload(profilePic, {
          folder: "chatapp/profiles",
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });
        update.profilePic = result.secure_url;
      } else if (profilePic.startsWith && (profilePic.startsWith("http://") || profilePic.startsWith("https://"))) {
        update.profilePic = profilePic;
      } else {
        try {
          const result = await cloudinary.uploader.upload(profilePic, {
            folder: "chatapp/profiles",
            transformation: [{ width: 500, height: 500, crop: "limit" }],
          });
          update.profilePic = result.secure_url;
        } catch (e) {
          console.error("Cloudinary upload failed", e);
        }
      }
    }

    const updated = await User.findByIdAndUpdate(user._id, { $set: update }, { new: true }).select("-password");

    return res.status(200).json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const full = await User.findById(user._id).select("-password");

    return res.status(200).json({ user: full });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
