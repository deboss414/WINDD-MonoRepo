import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TaskListScreen } from '../screens/task/TaskListScreen';
import { TaskDetailScreen } from '../screens/TaskDetailsScreen/TaskDetailScreen';
import { TaskFormScreen } from '../screens/task/TaskFormScreen';

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  TaskForm: undefined;
};

const Stack = createStackNavigator<TaskStackParamList>();

export const TaskStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TaskList"
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
        name="TaskList" 
        component={TaskListScreen}
      />
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