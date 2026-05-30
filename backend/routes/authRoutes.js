import express from 'express';
import { login, signup, verifyOTP, resendOTP } from '../controllers/authController.js';
import { googleLogin } from '../controllers/googleLoginController.js';




const router = express.Router();

router.post("/signup" , signup);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/google" , googleLogin)


export default router;