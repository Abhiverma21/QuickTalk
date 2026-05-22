import express from 'express';
import { login, signup } from '../controllers/authController.js';
import { googleLogin } from '../controllers/googleLoginController.js';




const router = express.Router();

router.post("/signup" , signup);
router.post("/login", login);
router.post("/google" , googleLogin)


export default router;