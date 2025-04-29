import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TaskDetailScreen } from '../screens/TaskDetailsScreen/TaskDetailScreen';
import { TaskFormScreen } from '../screens/task/TaskFormScreen';

export type CalendarTaskStackParamList = {
  TaskDetail: { taskId: string };
  TaskForm: { selectedDate?: string };
};

const Stack = createStackNavigator<CalendarTaskStackParamList>();

export const CalendarTaskStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
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
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{
          headerShown: false,
          header: () => null,
        }}
      />
      <Stack.Screen 
        name="TaskForm" 
        component={TaskFormScreen}
        options={{
          title: 'New Task',
        }}
      />
    </Stack.Navigator>
  );
}; 