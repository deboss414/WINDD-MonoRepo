import express from 'express';
import { authController } from '../controllers/user/auth';

const router = express.Router();

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

export default router; 