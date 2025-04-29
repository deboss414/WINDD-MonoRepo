import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { taskApi } from '../../api/taskApi';
import { chatApi } from '../../api/chatApi';
import type { Task } from '../../types/task';
import type { ChatStackParamList } from '../../navigation/ChatNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { Participant } from '../../types/chat';

type TaskSelectionScreenNavigationProp = StackNavigationProp<ChatStackParamList, 'TaskSelection'>;

export const TaskSelectionScreen: React.FC = () => {
  const navigation = useNavigation<TaskSelectionScreenNavigationProp>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = getColors(colorScheme);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getTasks();
      setTasks(response.tasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskPress = async (task: Task) => {
    try {
      console.log('Creating conversation for task:', task.id);
      
      // First get the task details to ensure we have the latest participant data
      const taskDetails = await taskApi.getTask(task.id);
      console.log('Got task details:', taskDetails);
      
      // Create the conversation first
      const conversation = await chatApi.createConversation(task.id);
      console.log('Created conversation:', conversation);
      
      if (!conversation || !conversation.id) {
        throw new Error('Failed to create conversation: No ID returned');
      }
      
      // Transform participants to match the Participant type
      const participants: Participant[] = taskDetails.participants.map(user => ({
        id: user.id || (user as any)._id, // Handle both id and _id formats
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.id === taskDetails.createdBy.id ? ('owner' as const) : ('member' as const),
        avatar: undefined,
        lastSeen: undefined
      }));

      console.log('Navigating to Chatroom with params:', {
        conversationId: conversation.id,
        taskId: task.id,
        taskTitle: task.title,
        taskStatus: task.status,
        isFirstLoad: true,
        participants
      });

      navigation.navigate('Chatroom', {
        conversationId: conversation.id,
        taskId: task.id,
        taskTitle: task.title,
        taskStatus: task.status,
        isFirstLoad: true,
        participants
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to create conversation. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.taskItem, { backgroundColor: colors.cardBackground }]}
            onPress={() => handleTaskPress(item)}
          >
            <View style={styles.taskContent}>
              <Text style={[styles.taskTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.taskStatus, { color: colors.secondaryText }]}>
                {item.status}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  listContent: {
    padding: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskStatus: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
}); 