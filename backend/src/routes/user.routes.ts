import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(authenticate);
router.post('/logout', logout);
router.get('/profile', getProfile);

export default router; 