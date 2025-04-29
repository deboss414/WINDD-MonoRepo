import { Task, SubTask } from '../types/task';
import { Comment } from '../types/comment';
import { TaskService } from '../services/task/TaskService';
import { api } from './api';

interface TaskResponse {
  task: Task;
}

interface TasksResponse {
  tasks: Task[];
}

const transformTask = (task: any): Task => {
  if (!task) return task;
  
  // Transform _id to id
  const transformedTask = {
    ...task,
    id: task._id || task.id,
  };

  // Transform subtasks if they exist
  if (transformedTask.subtasks) {
    transformedTask.subtasks = transformedTask.subtasks.map(transformSubTask);
  }

  return transformedTask;
};

const transformComment = (comment: any): Comment => {
  if (!comment) return comment;
  
  console.log('Transforming comment:', {
    id: comment._id || comment.id,
    text: comment.text,
    parentComment: comment.parentComment,
    replies: comment.replies
  });
  
  // Handle populated author
  const author = comment.author || {};
  const authorName = typeof author === 'string' ? {
    id: author,
    firstName: '',
    lastName: '',
    email: ''
  } : {
    id: author._id || author.id || '',
    firstName: author.firstName || '',
    lastName: author.lastName || '',
    email: author.email || ''
  };

  // Transform replies if they exist
  const replies = comment.replies ? comment.replies.map(transformComment) : [];
  console.log('Transformed replies:', replies);

  const transformedComment = {
    id: comment._id || comment.id,
    text: comment.text || '',
    author: authorName,
    createdAt: comment.createdAt || new Date().toISOString(),
    updatedAt: comment.updatedAt || new Date().toISOString(),
    parentComment: comment.parentComment?._id || comment.parentComment?.id || undefined,
    isEdited: comment.isEdited || false,
    subtask: comment.subtask?._id || comment.subtask?.id || '',
    replies: replies
  };

  console.log('Final transformed comment:', transformedComment);
  return transformedComment;
};

const transformSubTask = (subtask: any): SubTask => {
  if (!subtask) return subtask;
  
  return {
    ...subtask,
    id: subtask._id || subtask.id,
    progress: subtask.progress || 0,
    comments: subtask.comments?.map(transformComment) || []
  };
};

const taskService = TaskService.getInstance();

export const taskApi = {
  getTasks: async (): Promise<TasksResponse> => {
    return taskService.getTasks();
  },

  getTask: async (taskId: string): Promise<Task> => {
    try {
      const response = await api.get<TaskResponse>(`/tasks/${taskId}`);
      return transformTask(response.data.task);
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskResponse> => {
    try {
      const response = await taskService.createTask(task);
      return { task: transformTask(response.task) };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, data: Partial<Task>): Promise<Task> {
    const response = await api.put(`/tasks/${taskId}`, data);
    return transformTask(response.data);
  },

  deleteTask: async (taskId: string): Promise<void> => {
    return taskService.deleteTask(taskId);
  },

  async createSubTask(taskId: string, data: Omit<SubTask, 'id'>): Promise<SubTask> {
    const response = await api.post(`/tasks/${taskId}/subtasks`, data);
    return transformSubTask(response.data);
  },

  async updateSubTask(taskId: string, subtaskId: string, data: Partial<SubTask>): Promise<Task> {
    const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data);
    return transformTask(response.data.task);
  },

  async deleteSubTask(taskId: string, subtaskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
  },

  async updateSubTaskProgress(taskId: string, subtaskId: string, progress: number): Promise<Task> {
    const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}/progress`, { progress });
    return transformTask(response.data.task);
  },

  async addComment(taskId: string, subtaskId: string, text: string, parentCommentId?: string): Promise<Task> {
    try {
      console.log('Adding comment with:', { taskId, subtaskId, text, parentCommentId });
      const response = await api.post<TaskResponse>(`/tasks/${taskId}/subtasks/${subtaskId}/comments`, {
        text,
        parentCommentId
      });
      return transformTask(response.data.task);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async editComment(taskId: string, subtaskId: string, commentId: string, text: string): Promise<Task> {
    try {
      const response = await api.put<TaskResponse>(`/tasks/${taskId}/subtasks/${subtaskId}/comments/${commentId}`, {
        text
      });
      return transformTask(response.data.task);
    } catch (error) {
      console.error('Error editing comment:', error);
      throw error;
    }
  },

  async deleteComment(taskId: string, subtaskId: string, commentId: string): Promise<Task> {
    try {
      const response = await api.delete<TaskResponse>(`/tasks/${taskId}/subtasks/${subtaskId}/comments/${commentId}`);
      return transformTask(response.data.task);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  getTasksByStatus: async (status: Task['status']): Promise<TasksResponse> => {
    return taskService.getTasksByStatus(status);
  },

  getTasksByAssignee: async (userId: string): Promise<TasksResponse> => {
    return taskService.getTasksByAssignee(userId);
  },

  getTasksByDueDate: async (startDate: string, endDate: string): Promise<TasksResponse> => {
    return taskService.getTasksByDueDate(startDate, endDate);
  },

  searchTasks: async (query: string): Promise<TasksResponse> => {
    return taskService.searchTasks(query);
  },

  getTasksSorted: async (sortBy: keyof Task, order: 'asc' | 'desc' = 'asc'): Promise<TasksResponse> => {
    return taskService.getTasksSorted(sortBy, order);
  },

  addParticipant: async (taskId: string, userId: string): Promise<Task> => {
    try {
      const response = await api.post(`/tasks/${taskId}/participants`, {
        userId: userId
      });
      return transformTask(response.data.task);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  removeParticipant: async (taskId: string, participantId: string) => {
    const response = await api.delete(`/tasks/${taskId}/participants/${participantId}`);
    return response.data.task;
  }
};
