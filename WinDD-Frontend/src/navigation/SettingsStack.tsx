import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ProfileScreen } from '../screens/settings/ProfileScreen';
import { AccountSettingsScreen } from '../screens/settings/AccountSettingsScreen';
import { AppPreferencesScreen } from '../screens/settings/AppPreferencesScreen';
import { TeamSettingsScreen } from '../screens/settings/TeamSettingsScreen';

export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  AccountSettings: undefined;
  AppPreferences: undefined;
  TeamSettings: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{
          title: 'Account Settings',
        }}
      />
      <Stack.Screen
        name="AppPreferences"
        component={AppPreferencesScreen}
        options={{
          title: 'App Preferences',
        }}
      />
      <Stack.Screen
        name="TeamSettings"
        component={TeamSettingsScreen}
        options={{
          title: 'Team Settings',
        }}
      />
    </Stack.Navigator>
  );
}; 