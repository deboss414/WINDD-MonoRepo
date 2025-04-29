import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ConversationsListScreen } from '../screens/chat/ConversationsListScreen';
import { ChatroomScreen } from '../screens/chat/ChatroomScreen/index';
import { TaskSelectionScreen } from '../screens/chat/TaskSelectionScreen';
import { Message, Participant } from '@/types/chat';

export type ChatStackParamList = {
  ConversationsList: undefined;
  TaskSelection: undefined;
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

const Stack = createStackNavigator<ChatStackParamList>();

export const ChatNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ConversationsList" 
        component={ConversationsListScreen}
        options={{ title: 'Chats' }}
      />
      <Stack.Screen 
        name="TaskSelection" 
        component={TaskSelectionScreen}
        options={{ title: 'Select Task' }}
      />
      <Stack.Screen 
        name="Chatroom" 
        component={ChatroomScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
}; 