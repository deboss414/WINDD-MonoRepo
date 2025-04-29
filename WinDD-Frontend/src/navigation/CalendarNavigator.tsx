import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';
import { getColors } from '../constants/colors';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { EventFormScreen } from '../screens/calendar/EventFormScreen';
import { CalendarTaskStack } from './CalendarTaskStack';

export type CalendarStackParamList = {
  Calendar: undefined;
  CalendarTask: {
    screen: 'TaskForm' | 'TaskDetail';
    params: {
      selectedDate?: string;
      taskId?: string;
    };
  };
  EventForm: undefined;
};

const Stack = createStackNavigator<CalendarStackParamList>();

export const CalendarNavigator: React.FC = () => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Calendar" 
        component={CalendarScreen}
      />
      <Stack.Screen 
        name="CalendarTask" 
        component={CalendarTaskStack}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="EventForm" 
        component={EventFormScreen}
        options={{
          title: 'New Event',
        }}
      />
    </Stack.Navigator>
  );
}; 