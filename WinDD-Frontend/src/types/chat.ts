import type { TaskStatus } from '../components/task/TaskCard';

export interface Participant {
  id: string;
  name: string;
  email: string;
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
  _id?: string;
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  participants: Participant[];
  lastMessage?: Message;
  updatedAt: string;
  unreadCount: number;
  messages?: Message[];
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
} 