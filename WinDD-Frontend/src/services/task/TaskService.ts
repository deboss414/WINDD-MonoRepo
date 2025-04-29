import { BaseService } from '../base/BaseService';
import { Task, SubTask } from '../../types/task';

interface TaskResponse {
  task: Task;
}

interface TasksResponse {
  tasks: Task[];
}

export class TaskService extends BaseService {
  private static instance: TaskService;

  private constructor() {
    super('/tasks');
  }

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  async getTasks(): Promise<TasksResponse> {
    return this.get<TasksResponse>('/user');
  }

  async getTask(taskId: string): Promise<TaskResponse> {
    return this.get<TaskResponse>(`/${taskId}`);
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskResponse> {
    const taskData = {
      ...task,
      dueDate: new Date(task.dueDate).toISOString(),
      createdBy: task.createdBy?.id || task.assignedTo?.id,
      assignedTo: task.assignedTo?.id,
      status: task.status || 'in-progress',
      priority: task.priority || 'medium',
      participants: task.participants?.map(p => p.id) || [],
      subtasks: task.subtasks || []
    };
    return this.post<TaskResponse>('', taskData);
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<TaskResponse> {
    return this.put<TaskResponse>(`/${taskId}`, updates);
  }

  async deleteTask(taskId: string): Promise<void> {
    return this.delete<void>(`/${taskId}`);
  }

  // Subtask methods
  async addSubtask(taskId: string, subtask: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'comments' | 'createdBy'>): Promise<TaskResponse> {
    return this.post<TaskResponse>(`/${taskId}/subtasks`, subtask);
  }

  async updateSubtask(taskId: string, subtaskId: string, updates: Partial<SubTask>): Promise<TaskResponse> {
    return this.put<TaskResponse>(`/${taskId}/subtasks/${subtaskId}`, updates);
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<TaskResponse> {
    return this.delete<TaskResponse>(`/${taskId}/subtasks/${subtaskId}`);
  }

  async updateSubtaskProgress(taskId: string, subtaskId: string, progress: number): Promise<TaskResponse> {
    return this.put<TaskResponse>(`/${taskId}/subtasks/${subtaskId}/progress`, { progress });
  }

  // Comment methods
  async addComment(taskId: string, subtaskId: string, text: string, parentCommentId?: string): Promise<TaskResponse> {
    return this.post<TaskResponse>(`/${taskId}/subtasks/${subtaskId}/comments`, { text, parentCommentId });
  }

  async editComment(taskId: string, subtaskId: string, commentId: string, text: string): Promise<TaskResponse> {
    return this.put<TaskResponse>(`/${taskId}/subtasks/${subtaskId}/comments/${commentId}`, { text });
  }

  async deleteComment(taskId: string, subtaskId: string, commentId: string): Promise<TaskResponse> {
    return this.delete<TaskResponse>(`/${taskId}/subtasks/${subtaskId}/comments/${commentId}`);
  }

  // Task progress calculation
  async calculateTaskProgress(taskId: string): Promise<TaskResponse> {
    return this.get<TaskResponse>(`/${taskId}/progress`);
  }

  // Task status management
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<TaskResponse> {
    return this.put<TaskResponse>(`/${taskId}/status`, { status });
  }

  // Task assignment
  async assignTask(taskId: string, userId: string): Promise<TaskResponse> {
    return this.post<TaskResponse>(`/${taskId}/assign`, { userId });
  }

  async unassignTask(taskId: string, userId: string): Promise<TaskResponse> {
    return this.delete<TaskResponse>(`/${taskId}/assign/${userId}`);
  }

  // Task filtering and sorting
  async getTasksByStatus(status: Task['status']): Promise<TasksResponse> {
    return this.get<TasksResponse>('', { status });
  }

  async getTasksByAssignee(userId: string): Promise<TasksResponse> {
    return this.get<TasksResponse>('', { assignee: userId });
  }

  async getTasksByDueDate(startDate: string, endDate: string): Promise<TasksResponse> {
    return this.get<TasksResponse>('', { startDate, endDate });
  }

  // Task search
  async searchTasks(query: string): Promise<TasksResponse> {
    return this.get<TasksResponse>('', { search: query });
  }

  // Task sorting
  async getTasksSorted(sortBy: keyof Task, order: 'asc' | 'desc' = 'asc'): Promise<TasksResponse> {
    return this.get<TasksResponse>('', { sortBy, order });
  }
} 