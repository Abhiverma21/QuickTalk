import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import transporter from "../services/EmailService.js"
import { generateOTP } from "../services/otpService.js";



const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res
        .status(400)
        .json({ message: "username, email ,phone and password are required" });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain uppercase, lowercase, number, and special character",
      });
    }
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }],
    });
    if (existingUser) {
      if (existingUser.email === email.toLowerCase().trim()) {
        return res.status(409).json({ message: "Email already registered" });
      }
      if (existingUser.phone === phone.trim()) {
        return res
          .status(409)
          .json({ message: "Phone number already registered" });
      }
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name: name,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
    });
    let otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    
    try{
      const info = await transporter.sendMail({
        from: "QuickTalk",
        to:user.email,
        subject:"OTP for Verification",
        text:`Welcome to the platform. Your OTP for Verification is ${otp}` ,
        
      })
    }catch(err){
      console.log(err);
      
    }
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Account created successfully. Please verify your email with OTP",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    if (!user.isVerified) {
      let otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();
      
      try{
        await transporter.sendMail({
          from: "QuickTalk",
          to: user.email,
          subject: "OTP for Login Verification",
          text: `Your OTP for login verification is ${otp}`,
        });
      }catch(err){
        console.log(err);
      }
      
      return res.status(200).json({
        message: "Please verify your email with OTP sent to your email",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        requiresOTPVerification: true,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    let otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    try {
      await transporter.sendMail({
        from: "QuickTalk",
        to: user.email,
        subject: "OTP for Verification",
        text: `Your new OTP for verification is ${otp}`,
      });
    } catch (err) {
      console.log(err);
    }

    return res.status(200).json({
      message: "OTP resent successfully to your email",
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
