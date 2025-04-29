import { Conversation, Message } from '../../types/chat';
import { api } from '../../api/api';

class ChatService {
  private static instance: ChatService;
  private baseUrl = '/api/chat';

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Get all conversations
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get(`${this.baseUrl}/conversations`);
    return response.data;
  }

  // Get a single conversation with messages
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await api.get(`${this.baseUrl}/conversations/${conversationId}`);
    return response.data;
  }

  // Create a new conversation
  async createConversation(taskId: string, participantIds: string[]): Promise<Conversation> {
    const response = await api.post(`${this.baseUrl}/conversations`, {
      taskId,
      participantIds
    });
    return response.data;
  }

  // Send a message
  async sendMessage(conversationId: string, content: string, replyTo?: string): Promise<Message> {
    const response = await api.post(`${this.baseUrl}/conversations/${conversationId}/messages`, {
      content,
      replyTo
    });
    return response.data;
  }

  // Edit a message
  async editMessage(messageId: string, content: string): Promise<Message> {
    const response = await api.put(`${this.baseUrl}/messages/${messageId}`, {
      content
    });
    return response.data;
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/messages/${messageId}`);
  }

  // Mark messages as read
  async markAsRead(conversationId: string): Promise<void> {
    await api.put(`${this.baseUrl}/conversations/${conversationId}/read`);
  }

  // Get unread message count
  async getUnreadCount(): Promise<number> {
    const response = await api.get(`${this.baseUrl}/unread-count`);
    return response.data.count;
  }
}

export const chatService = ChatService.getInstance(); 