import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: {
    type: String,
  },

  password: {
    type: String,
    required: true
  },

  isOnline: {
    type: Boolean,
    default: false
  },

  lastSeen: {
    type: Date,
    default: Date.now
  },
  profilePic: {
  type: String,
  default: ""
},

  otp: {
    type: String,
    default: null
  },

  otpExpires: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000)
  },

  isVerified: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;