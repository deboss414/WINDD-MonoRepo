import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { TaskCard } from '../task/TaskCard';
import { Task } from '../../types/task';
import { getColors } from '../../constants/colors';
import { useColorScheme } from 'react-native';

interface FeaturedTasksSectionProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
}

export const FeaturedTasksSection: React.FC<FeaturedTasksSectionProps> = ({ tasks, onTaskPress }) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const pageNum = Math.round(contentOffset.x / viewSize);
    setActiveIndex(pageNum);
  };

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const pageNum = Math.round(contentOffset.x / viewSize);
    setActiveIndex(pageNum);
  };

  const handleTaskPress = (task: Task) => {
    onTaskPress(task);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!tasks.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Featured Tasks</Text>
        <Text style={[styles.date, { color: colors.text }]}>
          Due: {formatDate(tasks[activeIndex]?.dueDate || '')}
        </Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        snapToInterval={Dimensions.get('window').width - 32}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCardWrapper}
            onPress={() => handleTaskPress(task)}
          >
            <TaskCard task={task} onPress={() => handleTaskPress(task)} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  taskCardWrapper: {
    width: Dimensions.get('window').width - 30,
    paddingHorizontal: 8,
    marginHorizontal: 6,
  },
}); 