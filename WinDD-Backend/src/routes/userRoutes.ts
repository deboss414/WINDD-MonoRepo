import express from 'express';
import { UserController } from '../controllers/UserController';

const router = express.Router();
const userController = new UserController();

router.post('/users/search', userController.searchUserForParticipant);

export default router; 