import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { ITask } from '../models/task';
import Task from '../models/task';
import { Types } from 'mongoose';
import { ISubTask, ISubTaskInput } from '../models/subtask';
import { User } from '../models/user';

const taskService = new TaskService();

export class TaskController {
  async createTask(req: Request, res: Response) {
    try {
      const taskData = {
        ...req.body,
        createdBy: req.user._id
      };
      const task = await taskService.createTask(taskData);
      res.status(201).json({ task });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ message: 'Failed to create task' });
    }
  }

  async getTask(req: Request, res: Response) {
    try {
      const task = await taskService.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ task });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({ message: 'Failed to fetch task' });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ task });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ message: 'Failed to update task' });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const success = await taskService.deleteTask(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  }

  async getTasksByUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId || req.user._id;
      const status = req.query.status as string | undefined;
      const tasks = await taskService.getTasksByUser(userId, status);
      res.json({ tasks });
    } catch (error) {
      console.error('Get user tasks error:', error);
      res.status(500).json({ message: 'Failed to fetch user tasks' });
    }
  }

  async getTasksByStatus(req: Request, res: Response) {
    try {
      const tasks = await taskService.getTasksByStatus(req.params.status);
      res.json({ tasks });
    } catch (error) {
      console.error('Get tasks by status error:', error);
      res.status(500).json({ message: 'Failed to fetch tasks by status' });
    }
  }

  async searchTasks(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      const tasks = await taskService.searchTasks(query);
      res.json({ tasks });
    } catch (error) {
      console.error('Search tasks error:', error);
      res.status(500).json({ message: 'Failed to search tasks' });
    }
  }

  async getOverdueTasks(req: Request, res: Response) {
    try {
      const tasks = await taskService.getOverdueTasks();
      res.json({ tasks });
    } catch (error) {
      console.error('Get overdue tasks error:', error);
      res.status(500).json({ message: 'Failed to fetch overdue tasks' });
    }
  }

  // Task progress calculation
  async calculateTaskProgress(req: Request, res: Response) {
    try {
      const task = await taskService.calculateTaskProgress(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ task });
    } catch (error) {
      console.error('Calculate task progress error:', error);
      res.status(500).json({ message: 'Failed to calculate task progress' });
    }
  }

  // Task status management
  async updateTaskStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      const task = await taskService.updateTaskStatus(req.params.id, status);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ task });
    } catch (error) {
      console.error('Update task status error:', error);
      res.status(500).json({ message: 'Failed to update task status' });
    }
  }

  // Task assignment
  async assignTask(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      const task = await taskService.assignTask(req.params.id, userId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ task });
    } catch (error) {
      console.error('Assign task error:', error);
      res.status(500).json({ message: 'Failed to assign task' });
    }
  }

  async unassignTask(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      const task = await taskService.unassignTask(req.params.id, userId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ task });
    } catch (error) {
      console.error('Unassign task error:', error);
      res.status(500).json({ message: 'Failed to unassign task' });
    }
  }

  // Task filtering and sorting
  async getTasksByDueDate(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      const tasks = await taskService.getTasksByDueDate(startDate as string, endDate as string);
      res.json({ tasks });
    } catch (error) {
      console.error('Get tasks by due date error:', error);
      res.status(500).json({ message: 'Failed to fetch tasks by due date' });
    }
  }

  // Task sorting
  async getTasksSorted(req: Request, res: Response) {
    try {
      const { sortBy, order } = req.query;
      if (!sortBy) {
        return res.status(400).json({ message: 'Sort field is required' });
      }
      const tasks = await taskService.getTasksSorted(
        sortBy as keyof ITask,
        (order as 'asc' | 'desc') || 'asc'
      );
      res.json({ tasks });
    } catch (error) {
      console.error('Get sorted tasks error:', error);
      res.status(500).json({ message: 'Failed to fetch sorted tasks' });
    }
  }

  async createSubtask(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const subtaskData = req.body;
      const userId = req.user._id;
      
      const task = await taskService.createSubtask(taskId, subtaskData, userId);
      res.status(201).json({ task });
    } catch (error) {
      console.error('Create subtask error:', error);
      res.status(500).json({ message: 'Failed to create subtask' });
    }
  }

  async updateSubtask(req: Request, res: Response): Promise<void> {
    try {
      const { taskId, subtaskId } = req.params;
      const updates = req.body;
      
      const task = await taskService.updateSubtask(taskId, subtaskId, updates);
      res.status(200).json({ task });
    } catch (error) {
      console.error('Update subtask error:', error);
      res.status(500).json({ message: 'Failed to update subtask' });
    }
  }

  async createComment(req: Request, res: Response): Promise<void> {
    try {
      const { taskId, subtaskId } = req.params;
      const { text, parentCommentId } = req.body;
      const userId = req.user._id;

      console.log('Creating comment with:', { taskId, subtaskId, text, parentCommentId, userId });

      if (!text) {
        res.status(400).json({ message: 'Comment text is required' });
        return;
      }

      const task = await taskService.createComment(taskId, subtaskId, userId, text, parentCommentId);
      res.status(201).json({ task });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ message: 'Failed to create comment' });
    }
  }

  async deleteSubtask(req: Request, res: Response): Promise<void> {
    try {
      const { taskId, subtaskId } = req.params;
      const task = await taskService.deleteSubtask(taskId, subtaskId);
      res.status(200).json({ task });
    } catch (error) {
      console.error('Delete subtask error:', error);
      res.status(500).json({ message: 'Failed to delete subtask' });
    }
  }

  async updateSubTaskProgress(req: Request, res: Response): Promise<Response> {
    try {
      const { taskId, subtaskId } = req.params;
      const { progress } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ message: 'Progress must be a number between 0 and 100' });
      }

      const task = await taskService.updateSubTaskProgress(taskId, subtaskId, progress);
      return res.status(200).json({ task });
    } catch (error) {
      console.error('Update subtask progress error:', error);
      return res.status(500).json({ message: 'Failed to update subtask progress' });
    }
  }

  async addParticipant(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const { userId } = req.body;

      // Validate inputs
      if (!taskId || !userId) {
        return res.status(400).json({ message: 'Task ID and User ID are required' });
      }

      // Validate ObjectIds
      if (!Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ message: 'Invalid task ID format' });
      }
      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify task exists
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check if user is already a participant
      if (task.participants.includes(new Types.ObjectId(userId))) {
        return res.status(400).json({ message: 'User is already a participant' });
      }

      // Add the participant
      const updatedTask = await taskService.addParticipant(taskId, userId);
      res.json({ task: updatedTask });
    } catch (error: any) {
      console.error('Add participant error:', error);
      res.status(500).json({ message: 'Failed to add participant' });
    }
  }

  async removeParticipant(req: Request, res: Response) {
    try {
      const { taskId, participantId } = req.params;
      const task = await taskService.removeParticipant(taskId, participantId);
      res.json({ task });
    } catch (error: any) {
      console.error('Remove participant error:', error);
      if (error instanceof Error) {
        if (error.message === 'Task not found') {
          return res.status(404).json({ message: error.message });
        }
      }
      res.status(500).json({ message: 'Failed to remove participant' });
    }
  }
} 