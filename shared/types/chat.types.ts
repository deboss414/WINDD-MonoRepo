import { TaskStatus } from './task.types';

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'member';
  lastSeen?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  readBy: string[];
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
}

export interface Conversation {
  id: string;
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  participants: ChatParticipant[];
  lastMessage?: Message;
  updatedAt: string;
  unreadCount: number;
} 