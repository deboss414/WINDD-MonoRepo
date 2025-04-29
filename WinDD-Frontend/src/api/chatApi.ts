import { Task } from '../types/task';
import { Conversation, Message, Participant } from '../types/chat';
import { api } from './api';
import { taskApi } from './taskApi';

interface ChatMessage {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
  taskId: string;
}

interface ChatResponse {
  messages: ChatMessage[];
  task: Task;
}

export const chatApi = {
  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await api.get<Conversation[]>('/chat/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get a single conversation with its messages
  getConversation: async (conversationId: string): Promise<Conversation> => {
    try {
      const response = await api.get<Conversation>(`/chat/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Create a new conversation
  createConversation: async (taskId: string): Promise<Conversation> => {
    try {
      // First, get the task details to get title, status, and participants
      const task = await taskApi.getTask(taskId);
      
      // Transform task participants into chat participants
      const participants = task.participants.map(user => {
        // Ensure we have a valid ID
        const userId = user.id || (user as any)._id;
        if (!userId) {
          throw new Error('User ID is required for conversation participants');
        }

        return {
          id: userId,
          name: `${user.firstName} ${user.lastName}`,
          role: user.id === task.createdBy.id ? 'owner' : 'member'
        };
      });

      // Create the conversation with all the necessary information
      const response = await api.post<Conversation>('/chat/conversations', {
        taskId,
        taskTitle: task.title,
        taskStatus: task.status,
        participants
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Send a new message
  sendMessage: async (conversationId: string, content: string, replyTo?: string): Promise<Message> => {
    try {
      const response = await api.post<Message>(`/chat/conversations/${conversationId}/messages`, {
        content,
        replyTo
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      await api.delete(`/chat/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Edit a message
  editMessage: async (messageId: string, content: string): Promise<Message> => {
    try {
      const response = await api.put<Message>(`/chat/messages/${messageId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId: string): Promise<void> => {
    try {
      await api.put(`/chat/conversations/${conversationId}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Get unread message count
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get<{ count: number }>('/chat/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  // Get or create conversation
  getOrCreateConversation: async (
    taskId: string,
    participantIds: string[]
  ): Promise<Conversation> => {
    try {
      const response = await api.post<Conversation>('/chat/conversations', {
        taskId,
        participantIds
      });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },
};
