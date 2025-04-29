import { Comment } from './comment.types';

export type TaskStatus = 'in-progress' | 'completed' | 'expired' | 'closed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  progress?: number;
  priority: TaskPriority;
  dueDate: string;
  assignedTo?: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  participants: User[];
  subtasks: SubTask[];
  comments: Comment[];
}

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: User;
  progress: number;
  dueDate: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Participant {
  email: string;
  displayName: string;
}

export interface TaskResponse {
  task: Task;
}

export interface TasksResponse {
  tasks: Task[];
} 