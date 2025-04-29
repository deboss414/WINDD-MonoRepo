import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import type { Task } from '../task/TaskCard';

interface UpcomingTasksSummaryProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
}

interface GroupedTasks {
  [date: string]: Task[];
}

export const UpcomingTasksSummary: React.FC<UpcomingTasksSummaryProps> = ({ tasks, onTaskPress }) => {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [showAllTasks, setShowAllTasks] = useState(false);
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  // Validate tasks prop
  useEffect(() => {
    if (!Array.isArray(tasks)) {
      console.error('Tasks prop must be an array');
      return;
    }
    
    const invalidTasks = tasks.filter(task => !task.dueDate || !task.title);
    if (invalidTasks.length > 0) {
      console.error('Invalid tasks found:', invalidTasks);
    }
  }, [tasks]);

  // Get all upcoming tasks
  const getUpcomingTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    const upcomingTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      
      return taskDate >= today;
    });

    // Sort tasks by due date
    return upcomingTasks.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Group tasks by date
  const groupTasksByDate = (tasks: Task[]): GroupedTasks => {
    const grouped = tasks.reduce((acc, task) => {
      if (!task.dueDate) {
        console.warn('Task missing dueDate:', task);
        return acc;
      }

      const taskDate = new Date(task.dueDate);
      taskDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      const date = taskDate.toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as GroupedTasks);

    return grouped;
  };

  const upcomingTasks = getUpcomingTasks();
  const groupedTasks = groupTasksByDate(upcomingTasks);
  const sortedDates = Object.keys(groupedTasks).sort();

  // Get the first two dates with tasks
  const firstTwoDates = sortedDates.slice(0, 2);
  const remainingDates = sortedDates.slice(2);

  const toggleDate = (date: string) => {
    const newExpandedDates = new Set(expandedDates);
    if (newExpandedDates.has(date)) {
      newExpandedDates.delete(date);
    } else {
      newExpandedDates.add(date);
    }
    setExpandedDates(newExpandedDates);
  };

  const renderTask = ({ item }: { item: Task }) => {
    const taskDate = new Date(item.dueDate);
    taskDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    
    return (
      <TouchableOpacity
        style={[styles.taskItem, { backgroundColor: colors.cardBackground }]}
        onPress={() => onTaskPress(item)}
      >
        <View style={styles.taskContent}>
          <MaterialIcons
            name={item.status.toLowerCase() === 'completed' ? 'check-circle' : 'radio-button-unchecked'}
            size={16}
            color={getStatusColor(item.status, colors)}
          />
          <View style={styles.taskTextContainer}>
            <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.taskDateTime, { color: colors.secondaryText }]}>
              {taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateGroup = (date: string) => {
    const isExpanded = expandedDates.has(date);
    const tasksForDate = groupedTasks[date];
    const taskCount = tasksForDate.length;

    // Parse the date string and format it without timezone conversion
    const [year, month, day] = date.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);

    const formattedDate = parsedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });

    return (
      <View key={date} style={styles.dateGroup}>
        <TouchableOpacity
          style={[styles.dateHeader, { backgroundColor: colors.cardBackground }]}
          onPress={() => toggleDate(date)}
        >
          <View style={styles.dateHeaderContent}>
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formattedDate}
            </Text>
            <View style={styles.taskCountContainer}>
              <Text style={[styles.taskCount, { color: colors.secondaryText }]}>
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </Text>
              <MaterialIcons
                name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={20}
                color={colors.secondaryText}
              />
            </View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <Animated.View>
            <FlatList
              data={tasksForDate}
              renderItem={renderTask}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </Animated.View>
        )}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      marginBottom: 16,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
    },
    expandButton: {
      padding: 4,
    },
    listContent: {
      paddingBottom: 16,
    },
    dateGroup: {
      marginBottom: 8,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.cardBackground,
    },
    dateHeader: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    dateHeaderContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 16,
      fontWeight: '500',
    },
    taskCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    taskCount: {
      fontSize: 14,
      marginRight: 4,
    },
    taskItem: {
      padding: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    taskContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
    },
    taskTextContainer: {
      flex: 1,
      marginLeft: 8,
    },
    taskTitle: {
      fontSize: 14,
      fontWeight: '500',
    },
    taskDateTime: {
      fontSize: 12,
      marginTop: 2,
    },
    taskRightContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    taskDate: {
      fontSize: 12,
    },
    taskTime: {
      fontSize: 12,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Upcoming Tasks</Text>
          {remainingDates.length > 0 && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setShowAllTasks(!showAllTasks)}
            >
              <MaterialIcons
                name={showAllTasks ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Show first two dates */}
        {firstTwoDates.map(date => renderDateGroup(date))}
        
        {/* Show remaining dates if expanded */}
        {showAllTasks && remainingDates.map(date => renderDateGroup(date))}
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status: string, colors: any) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return colors.taskStatus.completed;
    case 'in-progress':
      return colors.taskStatus['in-progress'];
    case 'expired':
      return colors.taskStatus.expired;
    case 'closed':
      return colors.taskStatus.closed;
    default:
      return colors.secondaryText;
  }
}; 