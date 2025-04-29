import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  FlatList,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import type { Task } from '../../components/task/TaskCard';
import { taskApi } from '../../api/taskApi';
import { UpcomingTasksSummary } from '../../components/calendar/UpcomingTasksSummary';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.7;
const MAX_VISIBLE_DOTS = 3;

type RootStackParamList = {
  CalendarTask: {
    screen: 'TaskForm' | 'TaskDetail';
    params: {
      selectedDate?: string;
      taskId?: string;
    };
  };
  EventForm: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dots: { key: string; color: string; selectedDotColor: string }[];
    selected?: boolean;
    selectedColor?: string;
  };
}

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

export const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const taskButtonAnim = useRef(new Animated.Value(0)).current;
  const eventButtonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTasks();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    try {
      const response = await taskApi.getTasks();
      console.log('Fetched tasks:', response.tasks);
      setTasks(response.tasks);
      updateMarkedDates(response.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    }
  };

  const formatDate = (date: Date | string): string => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        console.warn('Invalid date:', date);
        return new Date().toISOString().split('T')[0];
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const updateMarkedDates = (tasks: Task[]) => {
    const marked: MarkedDates = {};

    // Group tasks by date
    const tasksByDate: { [date: string]: Task[] } = {};
    tasks.forEach(task => {
      try {
        const date = formatDate(task.dueDate);
        if (!tasksByDate[date]) {
          tasksByDate[date] = [];
        }
        tasksByDate[date].push(task);
      } catch (error) {
        console.error('Error grouping task by date:', task.id, error);
      }
    });

    // Create marked dates with dots
    Object.entries(tasksByDate).forEach(([date, dateTasks]) => {
      marked[date] = {
        marked: true,
        dots: [],
        selected: false,
      };

      // Add dots for visible tasks (up to MAX_VISIBLE_DOTS)
      dateTasks.slice(0, MAX_VISIBLE_DOTS).forEach(task => {
        marked[date].dots?.push({
          key: task.id,
          color: getStatusColor(task.status, colors),
          selectedDotColor: colors.white,
        });
      });
    });

    setMarkedDates(marked);
  };

  const getTasksForSelectedDate = () => {
    return tasks.filter(task => {
      try {
        const taskDate = formatDate(task.dueDate);
        return taskDate === selectedDate;
      } catch (error) {
        console.error('Error filtering task by date:', task.id, error);
        return false;
      }
    });
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  useEffect(() => {
    if (selectedDate) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [selectedDate]);

  const handleClosePanel = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const handleFabPress = () => {
    setIsFabExpanded(!isFabExpanded);
    Animated.parallel([
      Animated.spring(fabAnim, {
        toValue: isFabExpanded ? 0 : 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.spring(taskButtonAnim, {
        toValue: isFabExpanded ? 0 : 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.spring(eventButtonAnim, {
        toValue: isFabExpanded ? 0 : 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
    ]).start();
  };

  const handleAddTask = () => {
    setIsFabExpanded(false);
    Animated.parallel([
      Animated.spring(fabAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.spring(taskButtonAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.spring(eventButtonAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
    ]).start(() => {
      navigation.navigate('CalendarTask', {
        screen: 'TaskForm',
        params: { selectedDate }
      });
    });
  };

  const handleAddEvent = () => {
    setIsFabExpanded(false);
    Animated.parallel([
      Animated.spring(fabAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.spring(taskButtonAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.spring(eventButtonAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
    ]).start(() => {
      navigation.navigate('EventForm');
    });
  };

  const slideUpPanel = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [PANEL_HEIGHT, 0],
  });

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const isDateInPast = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('CalendarTask', {
      screen: 'TaskDetail',
      params: { taskId: task.id }
    });
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[
        styles.taskItem,
        { 
          backgroundColor: colors.cardBackground,
          borderLeftColor: getStatusColor(item.status, colors),
          borderLeftWidth: 4,
          opacity: isDateInPast(item.dueDate) ? 0.8 : 1,
        }
      ]}
      onPress={() => handleTaskPress(item)}
    >
      <View style={styles.taskContent}>
        <MaterialIcons 
          name={item.status.toLowerCase() === 'completed' ? 'check-circle' : 'radio-button-unchecked'} 
          size={20} 
          color={getStatusColor(item.status, colors)} 
        />
        <View style={styles.taskTextContainer}>
          <Text style={[styles.taskTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.taskTime, { color: colors.secondaryText }]}>
            {new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
      <View style={styles.taskRightContent}>
        <Text style={[styles.taskPercentage, { color: getStatusColor(item.status, colors) }]}>
          {item.progress || 0}%
        </Text>
        <MaterialIcons name="chevron-right" size={24} color={colors.secondaryText} />
      </View>
    </TouchableOpacity>
  );

  const fabRotation = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-90deg'],
  });

  const taskButtonTranslateY = taskButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const eventButtonTranslateY = eventButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -160],
  });

  const calendarTheme = {
    calendarBackground: colors.background,
    textSectionTitleColor: colors.text,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: colors.primary,
    dayTextColor: colors.text,
    textDisabledColor: colors.secondaryText,
    dotColor: colors.primary,
    monthTextColor: colors.text,
    arrowColor: colors.primary,
    'stylesheet.calendar.header': {
      dayHeader: {
        color: colors.secondaryText,
        fontWeight: '700',
      },
      monthText: {
        fontWeight: '700',
        fontSize: 18,
        color: colors.text,
      },
    },
    'stylesheet.calendar.main': {
      dayContainer: {
        borderRadius: 8,
        margin: 2,
      },
      dayText: {
        fontWeight: '600',
      },
      selected: {
        backgroundColor: colors.primary,
        borderRadius: 8,
      },
      selectedText: {
        color: '#FFFFFF',
        fontWeight: '600',
      },
      today: {
        backgroundColor: 'transparent',
      },
      todayText: {
        color: colors.primary,
        fontWeight: '600',
      },
      dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 2,
      },
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.calendarContainer}>
        <Calendar
          key={colorScheme}
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: colors.primary,
            },
          }}
          theme={calendarTheme}
          minDate="2024-01-01"
          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
          markingType="multi-dot"
        />
      </View>

      <UpcomingTasksSummary
        tasks={tasks}
        onTaskPress={handleTaskPress}
      />

      <TouchableWithoutFeedback onPress={handleClosePanel}>
        <Animated.View 
          style={[
            styles.backdrop,
            { 
              opacity: backdropOpacity,
              backgroundColor: colors.text,
            }
          ]} 
        />
      </TouchableWithoutFeedback>

      <Animated.View 
        style={[
          styles.slideUpPanel,
          { 
            backgroundColor: colors.cardBackground,
            transform: [{ translateY: slideUpPanel }],
          }
        ]}
      >
        <View style={styles.panelHeader}>
          <View>
            <Text style={[styles.dateTitle, { color: colors.text }]}>
              {formatDisplayDate(selectedDate)}
            </Text>
            {isDateInPast(selectedDate) && (
              <Text style={[styles.pastDateText, { color: colors.secondaryText }]}>
                Past Date
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={handleClosePanel}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={getTasksForSelectedDate()}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.taskList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={48} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No tasks for this day
              </Text>
            </View>
          }
        />
      </Animated.View>

      <Animated.View 
        style={[
          styles.fabContainer,
          {
            transform: [{ translateY: taskButtonTranslateY }],
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.fabOption, { backgroundColor: colors.primary }]}
          onPress={handleAddTask}
        >
          <MaterialIcons name="assignment" size={24} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        style={[
          styles.fabContainer,
          {
            transform: [{ translateY: eventButtonTranslateY }],
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.fabOption, { backgroundColor: colors.primary }]}
          onPress={handleAddEvent}
        >
          <MaterialIcons name="event" size={24} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        style={[
          styles.fabContainer,
          {
            transform: [{ rotate: fabRotation }],
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleFabPress}
        >
          <MaterialIcons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
  },
  calendarContainer: {
    height: '50%',
    padding: 16,
  },
  slideUpPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: PANEL_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  taskList: {
    flexGrow: 1,
  },
  taskItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskTime: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  fabOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  taskRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  pastDateText: {
    fontSize: 12,
    marginTop: 2,
  },
});
