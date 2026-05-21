import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
{
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],

  isGroupChat: {
    type: Boolean,
    default: false
  },

  groupName: {
    type: String,
    default: null
  },

  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null
  }

},
{ timestamps: true }
);

export default mongoose.model("Chat", chatSchema);