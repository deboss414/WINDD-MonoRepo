import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { useColorScheme } from 'react-native';
import { SubTask } from './SubTask';
import { SubTaskFormModal } from './SubTaskFormModal';
import { SubTaskCard } from './SubTask';

interface TaskSubtasksProps {
  taskId: string;
  subtasks: SubTask[];
  participants: Array<{ email: string; displayName: string }>;
  onProgressChange: (subtaskId: string, progress: number) => void;
  onUpdateSubTask: (subtaskId: string, data: Partial<SubTask>) => void;
  onSubtaskCreate: (data: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'comments' | 'createdBy'>) => void;
  onAddComment: (subtaskId: string, text: string, parentCommentId?: string) => void;
  onEditComment: (subtaskId: string, commentId: string, text: string) => void;
  onDeleteComment: (subtaskId: string, commentId: string) => void;
}

export const TaskSubtasks: React.FC<TaskSubtasksProps> = ({
  taskId,
  subtasks,
  participants,
  onProgressChange,
  onUpdateSubTask,
  onSubtaskCreate,
  onAddComment,
  onEditComment,
  onDeleteComment,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [isSubTaskModalVisible, setIsSubTaskModalVisible] = useState(false);
  const [isCreatingSubTask, setIsCreatingSubTask] = useState(false);

  const handleSubTaskSubmit = async (data: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'comments' | 'createdBy'>) => {
    try {
      setIsCreatingSubTask(true);
      await onSubtaskCreate(data);
      setIsSubTaskModalVisible(false);
    } catch (error) {
      console.error('Error creating subtask:', error);
    } finally {
      setIsCreatingSubTask(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Subtasks</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsSubTaskModalVisible(true)}
        >
          <MaterialIcons name="add" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
      {!subtasks?.length ? (
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          No subtasks yet. Add one to get started.
        </Text>
      ) : (
        subtasks.map((subtask) => (
          <SubTaskCard
            key={subtask.id}
            subtask={subtask}
            onProgressChange={(progress: number) => onProgressChange(subtask.id, progress)}
            onAddComment={onAddComment}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
            onUpdateSubTask={onUpdateSubTask}
            participants={participants.map(p => p.displayName)}
          />
        ))
      )}

      <SubTaskFormModal
        visible={isSubTaskModalVisible}
        onClose={() => {
          if (!isCreatingSubTask) {
            setIsSubTaskModalVisible(false);
          }
        }}
        onSubmit={handleSubTaskSubmit}
        participants={participants.map(p => p.displayName)}
        isSubmitting={isCreatingSubTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
}); 