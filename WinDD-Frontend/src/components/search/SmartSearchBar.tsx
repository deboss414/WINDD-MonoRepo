import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { SmartSearchBarProps, SearchFilters } from '../../types/search';
import { TaskStatus, TaskPriority } from '../../types/task';

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onSearch,
  onFilterChange,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  const parseSearchQuery = (text: string) => {
    const filters: SearchFilters = {};
    const words = text.split(' ');

    words.forEach(word => {
      // Check if it's a status
      const statusValues = ['in-progress', 'completed', 'pending', 'expired'];
      if (statusValues.includes(word.toLowerCase())) {
        filters.status = [word as TaskStatus];
        return;
      }

      // Check if it's a priority
      const priorityValues = ['high', 'medium', 'low'];
      if (priorityValues.includes(word.toLowerCase())) {
        filters.priority = [word as TaskPriority];
        return;
      }

      // Check if it's a date (YYYY-MM-DD format)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(word)) {
        filters.dueDate = { start: new Date(word) };
        return;
      }

      // Check if it's a progress percentage
      const progressValue = parseInt(word);
      if (!isNaN(progressValue) && progressValue >= 0 && progressValue <= 100) {
        filters.progress = { min: progressValue, max: progressValue };
        return;
      }

      // If none of the above, treat as title search
      if (!filters.text) {
        filters.text = word;
      } else {
        filters.text += ' ' + word;
      }
    });

    return filters;
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    onSearch(text);
    const filters = parseSearchQuery(text);
    onFilterChange(filters);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    onFilterChange({});
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
        <MaterialIcons name="search" size={24} color={colors.primary} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder="Search by title, status, priority, due date, or progress..."
          placeholderTextColor={colors.secondaryText}
          value={query}
          onChangeText={handleQueryChange}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <MaterialIcons name="clear" size={24} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 8,
  },
}); 