import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  RefreshControl,
  Keyboard,
  KeyboardEvent,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { getColors } from '../../constants/colors';
import { TaskStatus, Task, SubTask } from '../../types/task';
import { StackNavigationProp } from '@react-navigation/stack';
import { TaskHeader } from '../../components/task/TaskHeader';
import { TaskInfo } from '../../components/task/TaskInfo';
import { SubTaskList } from '../../components/task/SubTaskList';
import { SubTaskFormModal } from '../../components/task/SubTaskFormModal';
import { taskApi } from '../../api/taskApi';
import { chatApi } from '../../api/chatApi';

type RootStackParamList = {
  TaskDetail: { taskId: string };
  Chatroom: { conversationId: string; taskId: string; taskTitle: string };
};

type TaskDetailScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  route: TaskDetailScreenRouteProp;
}

export const TaskDetailScreen: React.FC<Props> = ({ route }) => {
  const { taskId } = route.params;
  const navigation = useNavigation<TaskDetailScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme || 'light');
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [isCreatingSubTask, setIsCreatingSubTask] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Add navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      header: () => null,
    });
  }, [navigation]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const taskDetails = await taskApi.getTask(taskId);
      setTask(taskDetails);
    } catch (err) {
      setError('Failed to load task details');
      Alert.alert('Error', 'Failed to load task details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleSubTaskProgressChange = async (subtaskId: string, progress: number) => {
    try {
      const updatedTask = await taskApi.updateSubTaskProgress(taskId, subtaskId, progress);
      setTask(updatedTask);
    } catch (err) {
      Alert.alert('Error', 'Failed to update subtask progress. Please try again.');
    }
  };

  const handleUpdateSubTask = async (subtaskId: string, data: Partial<SubTask>) => {
    try {
      const updatedTask = await taskApi.updateSubTask(taskId, subtaskId, data);
      setTask(updatedTask);
    } catch (error) {
      console.error('Error updating subtask:', error);
      Alert.alert('Error', 'Failed to update subtask');
    }
  };

  const handleSubTaskSubmit = async (data: Omit<SubTask, 'id'>) => {
    try {
      setIsCreatingSubTask(true);
      await taskApi.createSubTask(taskId, data);
      
      // Fetch the updated task to get the latest state
      const updatedTask = await taskApi.getTask(taskId);
      setTask(updatedTask);
      
      setShowSubTaskModal(false);
    } catch (error) {
      console.error('Error creating subtask:', error);
      Alert.alert('Error', 'Failed to create subtask');
    } finally {
      setIsCreatingSubTask(false);
    }
  };

  const handleAddComment = async (subtaskId: string, text: string, parentCommentId?: string) => {
    if (!task) return;

    try {
      // Make the API call first
      const updatedTask = await taskApi.addComment(taskId, subtaskId, text, parentCommentId);
      
      // Update the state with the response
      setTask(updatedTask);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };

  const handleEditComment = async (subtaskId: string, commentId: string, text: string) => {
    try {
      const updatedTask = await taskApi.editComment(taskId, subtaskId, commentId, text);
      setTask(updatedTask);
    } catch (error) {
      Alert.alert('Error', 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (subtaskId: string, commentId: string) => {
    try {
      const updatedTask = await taskApi.deleteComment(taskId, subtaskId, commentId);
      setTask(updatedTask);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const handleEditTask = () => {
    // No need to set isEditing since it's not used
  };

  const handleDeleteTask = async () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskApi.deleteTask(taskId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      if (!task) return;
      
      // Create a clean update object with only the fields that can be updated
      const updateData = {
        title: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
        status: updatedTask.status,
        priority: updatedTask.priority,
        assignedTo: updatedTask.assignedTo
      };

      await taskApi.updateTask(taskId, updateData);
      // Refresh the task data immediately
      await loadTaskDetails();
      setShowSubTaskModal(false);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleTaskInfoUpdate = async (data: { title: string; description: string; dueDate: string; status: TaskStatus }) => {
    try {
      if (!task) return;
      
      await taskApi.updateTask(taskId, {
        ...data,
        participants: task.participants,
        subtasks: task.subtasks,
      });
      // Refresh the task data immediately
      await loadTaskDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleGoToChat = async () => {
    if (!task || !task.participants) return;
    
    try {
      const conversation = await chatApi.getOrCreateConversation(
        taskId,
        task.participants.map(p => p.email)
      );
      
      navigation.navigate('Chatroom', {
        conversationId: conversation.id,
        taskId: taskId,
        taskTitle: task.title
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create chatroom. Please try again.');
    }
  };

  const handleParticipantAdd = async (userId: string) => {
    if (!task) return;
    
    try {
      const updatedTask = await taskApi.addParticipant(taskId, userId);
      
      if (updatedTask) {
        setTask(updatedTask);
      } else {
        throw new Error('Failed to update task with new participant');
      }
    } catch (error: any) {
      // Re-throw the error with the message from the API
      throw new Error(error.message);
    }
  };

  const handleParticipantRemove = async (email: string) => {
    if (!task) return;
    
    try {
      const response = await taskApi.updateTask(taskId, {
        ...task,
        participants: task.participants.filter(p => p.email !== email)
      });
      
      setTask(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove participant');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTaskDetails();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error || 'Task not found'}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      enabled
    >
      <FlatList
        data={[1]}
        renderItem={({ index }) => (
          <View 
            key={`task-details-${index}`} 
            style={[
              { paddingTop: Platform.OS === 'ios' ? 0 : 24 },
              keyboardHeight > 0 && { paddingBottom: keyboardHeight }
            ]}
          >
            <TaskHeader
              task={task}
              onBack={() => navigation.goBack()}
              onMenuPress={() => {}}
              onGoToChat={handleGoToChat}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />

            <TaskInfo
              task={task}
              onTaskUpdate={handleTaskInfoUpdate}
              onParticipantAdd={handleParticipantAdd}
              onParticipantRemove={handleParticipantRemove}
            />

            <View style={styles.section}>
              <SubTaskList
                subtasks={task?.subtasks || []}
                onSubTaskPress={(subtask) => {
                  console.log('Subtask pressed:', subtask);
                }}
                onProgressChange={handleSubTaskProgressChange}
                canEditProgress={true}
                onAddSubTask={() => setShowSubTaskModal(true)}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                participants={task?.participants || []}
                onRefresh={loadTaskDetails}
                isLoading={loading}
                onUpdateSubTask={handleUpdateSubTask}
              />
            </View>
          </View>
        )}
        keyExtractor={(_, index) => `task-details-${index}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.contentContainer}
      />

      <SubTaskFormModal
        visible={showSubTaskModal}
        onClose={() => setShowSubTaskModal(false)}
        onSubmit={async (data) => {
          if (!task) return;
          const fullData = {
            ...data,
            status: 'in-progress' as const,
            priority: 'medium' as const,
            createdBy: typeof task.createdBy === 'string' ? {
              id: task.createdBy,
              firstName: '',
              lastName: '',
              email: ''
            } : task.createdBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: []
          };
          await handleSubTaskSubmit(fullData);
        }}
        participants={task?.participants || []}
        isSubmitting={isCreatingSubTask}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  progress: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    padding: 16,
    lineHeight: 24,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionText: {
    marginLeft: 8,
    fontSize: 16,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participantText: {
    marginLeft: 4,
    fontSize: 14,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  editModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  editModalContent: {
    padding: 16,
    maxHeight: Platform.OS === 'ios' ? '70%' : '80%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  datePickerContainer: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: Platform.OS === 'ios' ? 10 : 0,
  },
  datePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : undefined,
  },
  inputText: {
    fontSize: 16,
  },
  editModalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  characterCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  participantChipText: {
    fontSize: 14,
    marginRight: 8,
  },
  removeParticipantButton: {
    padding: 2,
  },
  addParticipantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addParticipantButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantErrorText: {
    fontSize: 12,
    marginTop: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownContent: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  contentContainer: {
    flexGrow: 1,
  },
}); 