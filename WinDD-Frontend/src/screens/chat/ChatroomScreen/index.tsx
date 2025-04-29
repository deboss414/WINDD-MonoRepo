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

    console.log('ChatroomScreen useEffect triggered:', {
      conversationId,
      hasPreloadedMessages: !!preloadedMessages,
      isFirstLoad,
      currentMessages: messages.length,
      preloadedMessages: preloadedMessages
    });

    if (!preloadedMessages || preloadedMessages.length === 0) {
      console.log('No preloaded messages, loading conversation...');
      loadConversation();
    } else {
      console.log('Using preloaded messages:', preloadedMessages);
      setMessages(preloadedMessages);
      setLoading(false);
    }
  }, [conversationId]);

  const loadConversation = async () => {
    if (!conversationId) {
      console.error('Attempted to load conversation without ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Starting to load conversation with ID:', conversationId);
      const data = await chatApi.getConversation(conversationId);
      
      if (!data) {
        console.error('No conversation data received from API');
        throw new Error('No conversation data received');
      }
      
      console.log('Received conversation data:', {
        hasMessages: !!data.messages,
        messageCount: data.messages?.length,
        participantsCount: data.participants?.length,
        rawData: JSON.stringify(data, null, 2)
      });
      
      // Process messages to ensure they have proper IDs
      const processedMessages = data.messages?.map(msg => {
        console.log('Processing message:', {
          rawMessage: msg,
          hasId: !!msg.id,
          has_id: !!msg._id,
          timestamp: msg.timestamp || msg.createdAt
        });
        
        // Ensure we have a valid ID
        const messageId = msg._id?.toString() || msg.id;
        if (!messageId) {
          console.error('Invalid message ID:', msg);
          return null;
        }
        
        return {
          id: messageId,
          conversationId: msg.conversationId || conversationId,
          senderId: msg.senderId,
          senderName: msg.senderName,
          content: msg.content,
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
          readBy: msg.readBy || [],
          replyTo: msg.replyTo
        };
      }).filter(Boolean) as Message[] || [];
      
      console.log('Processed messages:', {
        count: processedMessages.length,
        messages: processedMessages
      });
      
      setConversation({
        id: conversationId,
        taskId,
        taskTitle,
        taskStatus,
        participants: data.participants || [],
        lastMessage: processedMessages[processedMessages.length - 1],
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        messages: processedMessages
      });
      
      setMessages(processedMessages);
      await chatApi.markAsRead(conversationId);
    } catch (err: any) {
      console.error('Error loading conversation:', {
        error: err,
        message: err?.message,
        response: err?.response?.data,
        stack: err?.stack
      });
      Alert.alert(
        'Error',
        'Failed to load messages. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      console.log('Loading complete, setting loading to false');
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
      
      console.log('Message sent successfully:', newMessage);
      
      if (!newMessage.id) {
        throw new Error('Message sent but no ID returned');
      }
      
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        console.log('Updated messages array:', updatedMessages);
        return updatedMessages;
      });
      
      setInputText('');
      setReplyingTo(null);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err: any) {
      console.error('Error sending message:', {
        error: err,
        message: err?.message,
        response: err?.response?.data
      });
      Alert.alert('Error', 'Failed to send message. Please try again.');
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
        currentUserId={routeParticipants?.find(p => p.name === 'Ben Osei')?.id || '67ea3001889d93d05aad5f76'}
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