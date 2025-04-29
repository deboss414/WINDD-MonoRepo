import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { getColors } from '../../constants/colors';
import { Task } from '../../types/task';
import { MainStackParamList } from '../../navigation/MainStack';

type NavigationProp = StackNavigationProp<MainStackParamList>;

interface TaskSummarySectionProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
}

export const TaskSummarySection: React.FC<TaskSummarySectionProps> = ({
  tasks,
  onTaskPress,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  const taskStats = {
    total: tasks.length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    overdue: tasks.filter(task => task.status === 'expired').length,
  };

  const renderStatCard = (title: string, count: number, icon: string, color: string) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => navigation.navigate('Tasks', { screen: 'TaskList' })}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statCount, { color: colors.text }]}>{count}</Text>
        <Text style={[styles.statTitle, { color: colors.secondaryText }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Task Summary</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Tasks', { screen: 'TaskList' })}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsGrid}>
        {renderStatCard('Total Tasks', taskStats.total, 'list-outline', colors.primary)}
        {renderStatCard('In Progress', taskStats.inProgress, 'time-outline', colors.taskStatus['in-progress'])}
        {renderStatCard('Completed', taskStats.completed, 'checkmark-circle-outline', colors.taskStatus.completed)}
        {renderStatCard('Overdue', taskStats.overdue, 'warning-outline', colors.taskStatus.expired)}
      </View>
      <View style={styles.recentTasks}>
        <Text style={[styles.recentTasksTitle, { color: colors.text }]}>Recent Tasks</Text>
        {tasks.slice(0, 3).map(task => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskItem, { backgroundColor: colors.cardBackground }]}
            onPress={() => onTaskPress(task)}
          >
            <View style={styles.taskItemContent}>
              <View style={[styles.statusIndicator, { backgroundColor: colors.taskStatus[task.status === 'in-progress' ? 'in-progress' : task.status] }]} />
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={[styles.taskDate, { color: colors.secondaryText }]}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
  },
  recentTasks: {
    marginBottom: 24,
  },
  recentTasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  taskItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 14,
  },
}); 