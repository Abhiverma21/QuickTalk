import express from 'express';
import { protect } from '../middleware/protect.js';
import { acceptInvitation, getMyInvitations, rejectInvitation, sendInvitation } from '../controllers/invitationController.js';




const router = express.Router();

router.post("/send" , protect, sendInvitation);
router.put("/accept/:id", protect, acceptInvitation);
router.put("/reject/:id", protect, rejectInvitation);
router.get("/myinvitation" , protect , getMyInvitations)


export default router;  