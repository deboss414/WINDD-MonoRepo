import { Router } from 'express';
import chatController from '../controllers/chatController';
import auth from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all chat routes
router.use(auth);

// Conversation routes
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:conversationId', chatController.getConversation);
router.post('/conversations', chatController.createConversation);

// Message routes
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.put('/conversations/:conversationId/read', chatController.markAsRead);
router.delete('/messages/:messageId', chatController.deleteMessage);
router.put('/messages/:messageId', chatController.editMessage);

export default router; 