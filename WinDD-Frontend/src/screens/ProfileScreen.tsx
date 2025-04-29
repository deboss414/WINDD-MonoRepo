import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { getColors } from '../constants/colors';

export const ProfileScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme || 'light');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>Profile</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
  },
}); 