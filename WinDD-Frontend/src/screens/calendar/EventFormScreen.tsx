import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { getColors } from '../../constants/colors';

export const EventFormScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme as 'light' | 'dark');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        Event Form Coming Soon!
      </Text>
      <Text style={[styles.subtext, { color: colors.secondaryText }]}>
        This feature is under development.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 24,

    fontWeight: '600',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 