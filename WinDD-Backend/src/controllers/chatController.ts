import { Request, Response } from 'express';
import chatService from '../services/chatService';
import { TaskStatus } from '../shared/types/task.types';

export class ChatController {
  // Get all conversations for the current user
  async getConversations(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // Assuming user is attached to request by auth middleware
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const conversations = await chatService.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get a single conversation with its messages
  async getConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const data = await chatService.getConversation(conversationId);
      res.json(data);
    } catch (error) {
      console.error('Error getting conversation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create a new conversation
  async createConversation(req: Request, res: Response) {
    try {
      const { taskId, taskTitle, taskStatus, participants } = req.body;

      if (!taskId || !taskTitle || !taskStatus || !participants) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const conversation = await chatService.createConversation(
        taskId,
        taskTitle,
        taskStatus as TaskStatus,
        participants
      );

      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Send a new message
  async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { content, replyTo } = req.body;
      const userId = req.user?.id;
      const userName = `${req.user?.firstName} ${req.user?.lastName}`.trim();

      if (!userId || !userName) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!content) {
        return res.status(400).json({ message: 'Message content is required' });
      }

      const message = await chatService.sendMessage(
        conversationId,
        userId,
        userName,
        content,
        replyTo
      );

      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Mark messages as read
  async markAsRead(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await chatService.markAsRead(conversationId, userId);
      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete a message
  async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      await chatService.deleteMessage(messageId);
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Edit a message
  async editMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'Message content is required' });
      }

      const message = await chatService.editMessage(messageId, content);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      res.json(message);
    } catch (error) {
      console.error('Error editing message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new ChatController(); 