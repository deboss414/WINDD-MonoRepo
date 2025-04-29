import { TaskStatus, TaskPriority } from './task';

export interface SearchFilters {
  text?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  dueDate?: {
    start?: Date;
    end?: Date;
  };
  assignedTo?: string[];
  progress?: {
    min?: number;
    max?: number;
  };
}

export interface SearchSuggestion {
  type: 'filter' | 'value';
  label: string;
  value: string;
  category?: 'status' | 'priority' | 'date' | 'assignee' | 'progress';
}

export interface SmartSearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  suggestions: SearchSuggestion[];
  initialQuery?: string;
  showFilters?: boolean;
  onShowFiltersChange?: (show: boolean) => void;
} 