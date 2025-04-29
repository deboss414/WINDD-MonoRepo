import { Comment } from './comment';

export type TaskStatus = 'in-progress' | 'completed' | 'expired' | 'closed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo?: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  progress: number;
  comments: Comment[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo?: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  participants: User[];
  subtasks: SubTask[];
  comments: Comment[];
  progress?: number;
} 