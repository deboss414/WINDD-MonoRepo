import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { TaskStatus, Task as TaskType } from '@/types/task';
import { CircularProgress } from '../common/CircularProgress';

export interface Task extends TaskType {
  progress?: number;
}

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const statusIcons = {
  'in-progress': 'time-outline' as const,
  'completed': 'checkmark-circle-outline' as const,
  'expired': 'alert-circle-outline' as const,
  'closed': 'close-circle-outline' as const,
};

const priorityIcons = {
  'high': 'arrow-up-circle-outline' as const,
  'medium': 'remove-circle-outline' as const,
  'low': 'arrow-down-circle-outline' as const,
};

const priorityColors = {
  'high': '#FF5252',
  'medium': '#FFA726',
  'low': '#66BB6A',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusText = (status: TaskStatus) => {
    return status === 'in-progress' ? 'In Progress' :
           status.charAt(0).toUpperCase() + status.slice(1);
  };

  const progress = task.progress || 0;
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.progress === 100).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
    >
      <View style={styles.mainContent}>
        <View style={styles.titleSection}>
          <Text 
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {task.title}
          </Text>
          <View style={styles.statusPriorityContainer}>
            <View style={[
              styles.statusContainer,
              { backgroundColor: `${colors.taskStatus[task.status]}15` }
            ]}>
              <Ionicons 
                name={statusIcons[task.status]}
                size={14}
                color={colors.taskStatus[task.status]}
              />
              <Text style={[styles.status, { color: colors.taskStatus[task.status] }]}>
                {getStatusText(task.status)}
              </Text>
            </View>
            <View style={[
              styles.priorityContainer,
              { backgroundColor: `${priorityColors[task.priority]}15` }
            ]}>
              <Ionicons 
                name={priorityIcons[task.priority]}
                size={16}
                color={priorityColors[task.priority]}
              />
            </View>
          </View>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <CircularProgress
              progress={progress}
              size={35}
              strokeWidth={3}
              showGlow={true}
              textStyle={{ fontSize: 9 }}
            />
            <View style={styles.metricLabel}>
              <Ionicons name="list-outline" size={12} color={colors.secondaryText} />
              <Text style={[styles.metricText, { color: colors.secondaryText }]}>
                {completedSubtasks}/{totalSubtasks}
              </Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <Ionicons name="people-outline" size={20} color={colors.secondaryText} />
            <Text style={[styles.metricText, { color: colors.secondaryText }]}>
              {task.participants?.length || 0}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.metricText, { color: colors.secondaryText }]}>
              {formatDate(task.dueDate)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CARD_WIDTH = Dimensions.get('window').width - 32; // 16px padding on each side
const CARD_HEIGHT = 120; // Fixed height for all cards

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  mainContent: {
    height: '100%',
    justifyContent: 'space-between',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 48, // Ensure minimum height for title section
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    lineHeight: 20, // Ensures consistent line height
  },
  statusPriorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4, // Align with first line of title
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4, // Align with first line of title
  },
  status: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto', // Push to bottom
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metricText: {
    fontSize: 12,
  },
});