import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  attachment: {
    url: {
      type: String,
    },
    mimetype: {
      type: String,
    }
  },
 status: {
  type: String,
  enum: ["sent", "delivered", "seen"],
  default: "sent",
},
  isDeleted: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],

}, {
  timestamps: true
});

export default mongoose.model('Message', messageSchema);
