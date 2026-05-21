import express from 'express';
import multer from 'multer';
import { searchUsers, getConnectedUsers, updateProfile, getProfile } from '../controllers/userController.js';
import { protect } from '../middleware/protect.js';




const upload = multer();
const router = express.Router();

router.get("/search" , protect, searchUsers);
router.get("/connected", protect, getConnectedUsers);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profilePic'), updateProfile);


export default router;