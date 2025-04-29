import { StackNavigationProp } from '@react-navigation/stack';
import { FlatList } from 'react-native';
import { Message, Conversation } from '../../../types/chat';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'member';
  lastSeen?: string;
}

export interface ChatroomData {
  id: string;
  taskId: string;
  taskTitle: string;
  taskStatus: string;
  participants: Participant[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

export type RootStackParamList = {
  TaskDetail: { taskId: string };
  Chatroom: { 
    conversationId: string; 
    taskId: string; 
    taskTitle: string; 
    taskStatus: string;
    preloadedMessages?: Message[];
    isFirstLoad: boolean;
    participants?: Participant[];
  };
};

export type ChatroomScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export interface ChatroomScreenProps {
  route: {
    params: {
      conversationId: string;
      taskId: string;
      taskTitle: string;
      taskStatus: string;
    };
  };
}

// Header Component Props
export interface ChatroomHeaderProps {
  taskTitle: string;
  taskId: string;
  participants: Participant[];
  onBackPress: () => void;
  onMenuPress: () => void;
  onParticipantsPress: () => void;
  showParticipantsModal: boolean;
  setShowParticipantsModal: (show: boolean) => void;
  colors: any; // Replace with proper color type
}

// MessageList Component Props
export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onReplyPress: (message: Message) => void;
  onEditPress: (message: Message) => void;
  onDeletePress: (message: Message) => void;
  colors: {
    primary: string;
    primaryTint: string;
    background: string;
    cardBackground: string;
    text: string;
    secondaryText: string;
    border: string;
    taskStatus: {
      inProgress: string;
      completed: string;
      pending: string;
    };
  };
  flatListRef: React.RefObject<FlatList>;
  loading?: boolean;
}

// ChatInput Component Props
export interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (message: string, replyTo?: { id: string; senderName: string; content: string; }) => void;
  onAttachmentSelect?: (type: 'photo' | 'video' | 'file', uri: string) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
  showAttachmentPicker?: boolean;
  setShowAttachmentPicker?: (show: boolean) => void;
  isSending?: boolean;
  colors: {
    primary: string;
    text: string;
    secondaryText: string;
    cardBackground: string;
  };
} 