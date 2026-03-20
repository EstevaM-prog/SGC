import express from 'express';
import { 
  createUser, 
  loginUser, 
  getUsers, 
  updateUsers, 
  deleteUsers,
  verifyCode,
  forgotPassword,
  resetPassword 
} from '../controllers/user.controller.js';

const router = express.Router();

// Public Routes
router.post('/', createUser);
router.post('/login', loginUser);
router.post('/verify', verifyCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Management Routes
router.get('/', getUsers);
router.put('/:id', updateUsers);
router.delete('/:id', deleteUsers);

export default router;