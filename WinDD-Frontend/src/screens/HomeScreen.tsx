import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Task } from '@/types/task';
import { taskApi } from '../api/taskApi';
import { MainStackParamList } from '../navigation/MainStack';
import { getColors } from '../constants/colors';
import { TopSection } from '../components/home/TopSection';
import { FeaturedTasksSection } from '../components/home/FeaturedTasksSection';
import { TaskSummarySection } from '../components/home/TaskSummarySection';

type NavigationProp = StackNavigationProp<MainStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    try {
      const response = await taskApi.getTasks();
      setTasks(response.tasks as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('Tasks', {
      screen: 'TaskDetail',
      params: { taskId: task.id }
    });
  };

  // Sort tasks by status priority: in-progress > completed > expired > closed
  const sortedTasks = [...tasks].sort((a, b) => {
    const statusOrder = {
      'in-progress': 0,
      'completed': 1,
      'expired': 2,
      'closed': 3
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Get featured tasks (first 10 tasks, sorted by status)
  const featuredTasks = sortedTasks.slice(0, 10);

  // Filter tasks for the summary section
  const filteredTasks = tasks.filter(task => {
    if (searchQuery) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             task.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeFilter) {
      switch (activeFilter.toLowerCase()) {
        case 'in progress':
          return task.status === 'in-progress';
        case 'completed':
          return task.status === 'completed';
        case 'overdue':
          return task.status === 'expired';
        case 'closed':
          return task.status === 'closed';
        default:
          return true;
      }
    }
    return true;
  });

  // Sort filtered tasks by due date and status for the summary section
  const sortedFilteredTasks = [...filteredTasks].sort((a, b) => {
    // First sort by status priority
    const statusOrder = {
      'in-progress': 1,
      'completed': 0,
      'expired': 2,
      'closed': 3
    };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Then sort by due date (earlier dates first)
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <TopSection
        inProgressCount={tasks.filter(task => task.status === 'in-progress').length}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      <FeaturedTasksSection
        tasks={featuredTasks}
        onTaskPress={handleTaskPress}
      />
      <TaskSummarySection
        tasks={sortedFilteredTasks}
        onTaskPress={handleTaskPress}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
});