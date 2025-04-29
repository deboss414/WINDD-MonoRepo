import { SearchFilters, SearchSuggestion } from '../types/search';
import { TaskStatus, TaskPriority } from '../types/task';

export class SearchService {
  private static instance: SearchService;
  private filterKeywords = ['status', 'priority', 'due', 'assigned', 'progress'];

  private constructor() {}

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  parseQuery(query: string): SearchFilters {
    const filters: SearchFilters = {};
    const words = query.toLowerCase().split(' ');

    // Parse status filters
    const statusKeywords = ['completed', 'in-progress', 'expired', 'closed'];
    const statuses = words.filter(word => statusKeywords.includes(word));
    if (statuses.length > 0) {
      filters.status = statuses as TaskStatus[];
    }

    // Parse priority filters
    const priorityKeywords = ['high', 'medium', 'low'];
    const priorities = words.filter(word => priorityKeywords.includes(word));
    if (priorities.length > 0) {
      filters.priority = priorities as TaskPriority[];
    }

    // Parse date filters
    const dateKeywords = ['today', 'week', 'month', 'overdue'];
    const dateFilter = words.find(word => dateKeywords.includes(word));
    if (dateFilter) {
      filters.dueDate = this.parseDateFilter(dateFilter);
    }

    // Parse progress filters
    const progressMatch = query.match(/(\d+)%?/);
    if (progressMatch) {
      const progress = parseInt(progressMatch[1]);
      if (!isNaN(progress)) {
        filters.progress = { min: progress, max: progress };
      }
    }

    // Parse assignee filters
    const assigneeMatch = query.match(/assigned:(\w+)/);
    if (assigneeMatch) {
      filters.assignedTo = [assigneeMatch[1]];
    }

    // Extract text search (remaining words that aren't part of filters)
    const textWords = words.filter(word => 
      !statusKeywords.includes(word) &&
      !priorityKeywords.includes(word) &&
      !dateKeywords.includes(word) &&
      !word.match(/^\d+%?$/) &&
      !word.startsWith('assigned:')
    );
    if (textWords.length > 0) {
      filters.text = textWords.join(' ');
    }

    return filters;
  }

  generateSuggestions(query: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const words = query.toLowerCase().split(' ');
    const lastWord = words[words.length - 1];

    // Status suggestions
    if (lastWord.startsWith('status:')) {
      const statuses: TaskStatus[] = ['in-progress', 'completed', 'expired', 'closed'];
      suggestions.push(...statuses.map(status => ({
        type: 'value',
        label: status,
        value: `status:${status}`,
        category: 'status'
      })));
    }

    // Priority suggestions
    if (lastWord.startsWith('priority:')) {
      const priorities: TaskPriority[] = ['high', 'medium', 'low'];
      suggestions.push(...priorities.map(priority => ({
        type: 'value',
        label: priority,
        value: `priority:${priority}`,
        category: 'priority'
      })));
    }

    // Date suggestions
    if (lastWord.startsWith('due:')) {
      const dateOptions = ['today', 'this week', 'this month', 'overdue'];
      suggestions.push(...dateOptions.map(date => ({
        type: 'value',
        label: date,
        value: `due:${date}`,
        category: 'date'
      })));
    }

    // Filter keyword suggestions
    if (!this.filterKeywords.some(keyword => lastWord.startsWith(keyword + ':'))) {
      suggestions.push(...this.filterKeywords.map(keyword => ({
        type: 'filter',
        label: `${keyword}:`,
        value: `${keyword}:`,
        category: keyword as any
      })));
    }

    return suggestions;
  }

  private parseDateFilter(dateFilter: string): { start?: Date; end?: Date } {
    const today = new Date();
    const result: { start?: Date; end?: Date } = {};

    switch (dateFilter) {
      case 'today':
        result.start = new Date(today.setHours(0, 0, 0, 0));
        result.end = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        result.start = new Date(startOfWeek.setHours(0, 0, 0, 0));
        result.end = new Date(today.setDate(today.getDate() + (6 - today.getDay())));
        break;
      case 'month':
        result.start = new Date(today.getFullYear(), today.getMonth(), 1);
        result.end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'overdue':
        result.end = new Date(today.setHours(0, 0, 0, 0));
        break;
    }

    return result;
  }
} 