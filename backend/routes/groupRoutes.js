import express from 'express';
import {
  createGroup,
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup,
  getMyGroups,
} from '../controllers/groupController.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.post('/create', protect, createGroup);
router.delete('/:id', protect, deleteGroup);
router.put('/:id/add', protect, addUserToGroup);
router.put('/:id/remove', protect, removeUserFromGroup);
router.get('/my', protect, getMyGroups);

export default router;
