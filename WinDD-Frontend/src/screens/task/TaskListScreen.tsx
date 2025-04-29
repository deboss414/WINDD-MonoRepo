import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TaskCard, Task } from '../../components/task/TaskCard';
import { taskApi } from '../../api/taskApi';
import { MainStackParamList } from '../../navigation/MainStack';
import { getColors } from '../../constants/colors';
import { SmartSearchBar } from '../../components/search/SmartSearchBar';
import { SearchService } from '../../services/SearchService';
import debounce from 'lodash/debounce';

type TaskListScreenNavigationProp = StackNavigationProp<MainStackParamList>;

export const TaskListScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<TaskListScreenNavigationProp>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = getColors(colorScheme);
  const searchService = SearchService.getInstance();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 40,
      backgroundColor: colors.background,
    },
    titleContainer: {
      padding: 16,
      paddingBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      flex: 1,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      zIndex: 1,
    },
    listContent: {
      padding: 16,
      paddingTop: 0,
      zIndex: 0,
    },
    cardContainer: {
      marginBottom: 4,
    },
    errorText: {
      fontSize: 16,
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    searchInputContainer: {
      flex: 1,
    },
    filterButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskApi.getTasks();
      setTasks(response.tasks);
      setFilteredTasks(response.tasks);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      const filters = searchService.parseQuery(query);
      const filtered = tasks.filter(task => {
        // Text search
        if (filters.text) {
          const searchText = filters.text.toLowerCase();
          if (!task.title.toLowerCase().includes(searchText) &&
              !task.description?.toLowerCase().includes(searchText)) {
            return false;
          }
        }

        // Status filter
        if (filters.status?.length) {
          const taskStatus = task.status.toLowerCase();
          if (!filters.status.some(status => status.toLowerCase() === taskStatus)) {
            return false;
          }
        }

        // Priority filter
        if (filters.priority?.length) {
          const taskPriority = task.priority.toLowerCase();
          if (!filters.priority.some(priority => priority.toLowerCase() === taskPriority)) {
            return false;
          }
        }

        // Due date filter
        if (filters.dueDate) {
          const dueDate = new Date(task.dueDate);
          if (filters.dueDate.start && dueDate < filters.dueDate.start) {
            return false;
          }
          if (filters.dueDate.end && dueDate > filters.dueDate.end) {
            return false;
          }
        }

        // Progress filter
        if (filters.progress) {
          const taskProgress = task.progress ?? 0;
          if (filters.progress.min && taskProgress < filters.progress.min) {
            return false;
          }
          if (filters.progress.max && taskProgress > filters.progress.max) {
            return false;
          }
        }

        return true;
      });
      setFilteredTasks(filtered);
    }, 300),
    [tasks]
  );

  const handleSearch = (query: string) => {
    debouncedSearch(query);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTasks();
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: colors.taskStatus.expired }]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTasks}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
        </View>

        <View style={styles.searchContainer}>
          <SmartSearchBar
            onSearch={handleSearch}
            onFilterChange={() => {}}
            suggestions={[]}
          />
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('Tasks', {
                screen: 'TaskDetail',
                params: { taskId: item.id }
              })}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Tasks', {
          screen: 'TaskForm'
        })}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}; 