import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

type RootStackParamList = {
  Chat: undefined;
  NotifScreen: undefined;
  TaskList: { filter?: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TopSectionProps {
  inProgressCount: number;
  onSearch: (query: string) => void;
  onFilterChange: (filter: string | null) => void;
}

export const TopSection: React.FC<TopSectionProps> = ({
  inProgressCount,
  onSearch,
  onFilterChange,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const { user } = useAuth();

  // Debug logging
  console.log('TopSection - Current user:', user);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  const handleFilterSelect = (filter: string) => {
    const newFilter = filter === selectedFilter ? null : filter;
    setSelectedFilter(newFilter);
    onFilterChange(newFilter);
    setShowFilters(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Welcome, {user?.firstName || 'User'}
          </Text>
          <Text style={[styles.taskCount, { color: colors.secondaryText }]}>
            You have {inProgressCount} tasks in progress
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => navigation.navigate('NotifScreen')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            <View style={[styles.notificationBadge, { borderColor: colors.cardBackground, backgroundColor: colors.taskStatus.expired }]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="search-outline" size={20} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tasks..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: colors.cardBackground }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={[styles.filterDropdown, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.filterArrow, { backgroundColor: colors.cardBackground }]} />
          {['Category', 'In Progress', 'Completed', 'Overdue'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterOption,
                selectedFilter === filter && styles.activeFilterOption
              ]}
              onPress={() => handleFilterSelect(filter)}
            >
              <Text style={[
                styles.filterText,
                { color: colors.text },
                selectedFilter === filter && styles.activeFilterText
              ]}>
                {filter}
              </Text>
              {selectedFilter === filter && (
                <Ionicons name="checkmark" size={20} color={colors.primary} style={styles.checkmark} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 14,
    opacity: 0.8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  searchInputContainer: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDropdown: {
    position: 'absolute',
    top: 140,
    right: 16,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    width: 200,
  },
  filterArrow: {
    position: 'absolute',
    top: -8,
    right: 20,
    width: 16,
    height: 16,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#000',
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 5,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  activeFilterOption: {
    backgroundColor: '#E0F2F1',
  },
  filterText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  activeFilterText: {
    fontWeight: '600',
  },
  checkmark: {
    marginLeft: 8,
  },
}); 