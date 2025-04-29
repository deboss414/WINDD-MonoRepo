import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  useColorScheme,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { getColors } from '../../../constants/colors';
import { chatApi } from '../../../api/chatApi';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatroomHeader } from './ChatroomHeader';
import type { Message, Conversation } from '../../../types/chat';
import type { ChatStackParamList } from '../../../navigation/ChatNavigator';

type ChatroomScreenRouteProp = RouteProp<ChatStackParamList, 'Chatroom'>;

export const ChatroomScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ChatroomScreenRouteProp>();
  const { conversationId, taskId, taskTitle, taskStatus, preloadedMessages, isFirstLoad, participants: routeParticipants } = route.params;
  
  // Debug logging for initial params
  console.log('ChatroomScreen mounted with params:', {
    conversationId,
    taskId,
    taskTitle,
    taskStatus,
    hasPreloadedMessages: !!preloadedMessages,
    isFirstLoad,
    participantsCount: routeParticipants?.length
  });

  const [messages, setMessages] = useState<Message[]>(preloadedMessages || []);
  const [loading, setLoading] = useState(isFirstLoad);
  const [conversation, setConversation] = useState<Conversation | null>({
    id: conversationId,
    taskId,
    taskTitle,
    taskStatus,
    participants: routeParticipants || [],
    updatedAt: new Date().toISOString(),
    unreadCount: 0
  });
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [inputText, setInputText] = useState('');
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = getColors(colorScheme);

  useEffect(() => {
    if (!conversationId) {
      console.error('No conversation ID provided in route params');
      return;
    }

    if (!preloadedMessages) {
      loadConversation();
    } else {
      console.log('Using preloaded messages:', preloadedMessages);
    }
  }, [conversationId]);

  const loadConversation = async () => {
    if (!conversationId) {
      console.error('Attempted to load conversation without ID');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading conversation with ID:', conversationId);
      const data = await chatApi.getConversation(conversationId);
      console.log('Loaded conversation data:', {
        conversationId,
        messagesCount: data.messages?.length,
        participantsCount: data.participants?.length
      });
      
      setConversation({
        id: conversationId,
        taskId,
        taskTitle,
        taskStatus,
        participants: data.participants || [],
        lastMessage: data.messages?.[data.messages.length - 1],
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        messages: data.messages
      });
      
      if (data.messages) {
        setMessages(data.messages);
      }
      
      await chatApi.markAsRead(conversationId);
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    if (!conversationId) {
      console.error('No conversation ID available for sending message');
      return;
    }

    try {
      setIsSending(true);
      console.log('Sending message to conversation:', conversationId);
      const newMessage = await chatApi.sendMessage(
        conversationId,
        message,
        replyingTo?.id
      );
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setReplyingTo(null);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleDeleteMessage = async (message: Message) => {
    try {
      await chatApi.deleteMessage(message.id);
      setMessages(prev => prev.filter(m => m.id !== message.id));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleEditMessage = async (message: Message, newContent: string) => {
    try {
      const updatedMessage = await chatApi.editMessage(message.id, newContent);
      setMessages(prev => prev.map(m => m.id === message.id ? updatedMessage : m));
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  const handleEditMessageWrapper = (message: Message) => {
    Alert.prompt(
      'Edit Message',
      'Enter new message content',
      (newContent: string) => {
        if (newContent) {
          handleEditMessage(message, newContent);
        }
      }
    );
  };

  const messageListColors = {
    ...colors,
    border: colors.divider,
    primaryTint: `${colors.primary}80`, // 50% opacity version of primary color
    taskStatus: {
      inProgress: colors.taskStatus['in-progress'],
      completed: colors.taskStatus.completed,
      pending: colors.taskStatus.expired,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChatroomHeader
        taskTitle={taskTitle}
        taskId={taskId}
        participants={conversation?.participants || []}
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => {}}
        onParticipantsPress={() => {}}
        showParticipantsModal={false}
        setShowParticipantsModal={() => {}}
        colors={colors}
      />
      
      <MessageList
        messages={messages}
        currentUserId="1" // TODO: Get from auth context
        onReplyPress={handleReply}
        onEditPress={handleEditMessageWrapper}
        onDeletePress={handleDeleteMessage}
        colors={messageListColors}
        flatListRef={flatListRef}
        loading={loading}
      />

      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        showAttachmentPicker={showAttachmentPicker}
        setShowAttachmentPicker={setShowAttachmentPicker}
        isSending={isSending}
        colors={colors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 