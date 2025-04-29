import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { IconProps } from '@expo/vector-icons/build/createIconSet';
import { useColorScheme } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { TaskListScreen } from '../screens/task/TaskListScreen';
import { TaskDetailScreen } from '../screens/TaskDetailsScreen/TaskDetailScreen';
import { TaskFormScreen } from '../screens/task/TaskFormScreen';
import { NotifScreen } from '../screens/notification/NotifScreen';
import { ChatNavigator } from './ChatNavigator';
import { getColors } from '../constants/colors';
import { CalendarNavigator } from './CalendarNavigator';
import { TaskStack as TaskStackComponent, TaskStackParamList as TaskStackType } from './TaskStack';
import { SettingsStack } from './SettingsStack';
import { TestConnectionScreen } from '../screens/TestConnectionScreen';

// Types for the Task stack navigator
export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  TaskForm: undefined;
};

const TaskStack = createStackNavigator<TaskStackParamList>();

// Task Stack Navigator
const TaskStackNavigator = () => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  return (
    <TaskStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <TaskStack.Screen 
        name="TaskList" 
        component={TaskListScreen}
        options={{ title: 'Tasks' }}
      />
      <TaskStack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
      <TaskStack.Screen 
        name="TaskForm" 
        component={TaskFormScreen}
        options={{ title: 'New Task' }}
      />
    </TaskStack.Navigator>
  );
};

// Types for the bottom tab navigator
export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Chat: undefined;
  NotifScreen: undefined;
  Settings: undefined;
  Tasks: {
    screen?: keyof TaskStackType;
    params?: {
      taskId?: string;
    };
  };
  TestConnection: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = keyof typeof MaterialIcons.glyphMap;

export const MainTabs = () => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'house';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar-today' : 'calendar-today';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chat' : 'chat-bubble-outline';
          } else if (route.name === 'NotifScreen') {
            iconName = focused ? 'notifications' : 'notifications-none';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-applications';
          } else if (route.name === 'Tasks') {
            iconName = 'home';
          } else if (route.name === 'TestConnection') {
            iconName = 'wifi';
          } else {
            iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.divider,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarNavigator} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen 
        name="NotifScreen" 
        component={NotifScreen}
        options={{ tabBarLabel: 'Notifications' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack}
        options={{ tabBarLabel: 'Settings' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TaskStackComponent}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen 
        name="TestConnection" 
        component={TestConnectionScreen}
        options={{
          title: 'Test Connection',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wifi" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 