import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { NotifScreen } from '../screens/notification/NotifScreen';
import { TaskListScreen } from '../screens/task/TaskListScreen';
import { TaskStack, TaskStackParamList } from './TaskStack';

export type MainStackParamList = {
  Home: undefined;
  Notifications: undefined;
  TaskList: undefined;
  Tasks: {
    screen?: keyof TaskStackParamList;
    params?: {
      taskId?: string;
      source?: 'calendar' | 'taskList';
    };
  };
};

const Stack = createStackNavigator<MainStackParamList>();

export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2A9D8F',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotifScreen}
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen 
        name="TaskList" 
        component={TaskListScreen}
        options={{
          title: 'Tasks',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Tasks" 
        component={TaskStack}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}; 