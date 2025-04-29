import { ITask } from '../models/task';
import Task from '../models/task';
import { Types } from 'mongoose';
import { ISubTask } from '../models/subtask';
import SubTask from '../models/subtask';
import mongoose, { Document } from 'mongoose';
import { ISubTaskInput } from '../models/subtask';
import Comment from '../models/comment';
import { IUser } from '../models/user';
import { IComment } from '../models/comment';
import { User } from '../models/user';

interface PopulatedComment {
  _id: mongoose.Types.ObjectId;
  text: string;
  author: {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  parentComment?: mongoose.Types.ObjectId;
  isEdited: boolean;
  replies?: PopulatedComment[];
}

interface PopulatedSubTask extends Omit<ISubTask, 'comments'> {
  _id: mongoose.Types.ObjectId;
  comments: PopulatedComment[];
}

type PopulatedTask = Document & Omit<ITask, 'subtasks'> & {
  _id: mongoose.Types.ObjectId;
  subtasks: PopulatedSubTask[];
};

interface TransformedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface TransformedComment {
  id: string;
  text: string;
  author: TransformedUser;
  createdAt: string;
  updatedAt: string;
  parentComment?: string;
  isEdited: boolean;
  subtask: string;
  replies?: TransformedComment[];
}

interface TransformedSubTask {
  id: string;
  title: string;
  description?: string;
  status: 'in-progress' | 'completed' | 'expired' | 'closed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo?: TransformedUser;
  createdBy: TransformedUser;
  createdAt: string;
  updatedAt: string;
  progress: number;
  comments: TransformedComment[];
}

interface TransformedTask {
  _id: string;
  title: string;
  description: string;
  status: 'in-progress' | 'completed' | 'expired' | 'closed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  progress?: number;
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  subtasks: Array<{
    _id: string;
    title: string;
    description: string;
    status: 'in-progress' | 'completed' | 'expired' | 'closed';
    progress: number;
    comments: TransformedComment[];
  }>;
}

const isPopulatedUser = (user: any): user is IUser & { _id: Types.ObjectId } => {
  return user && typeof user.firstName === 'string' && 
         typeof user.lastName === 'string' && 
         typeof user.email === 'string' &&
         user._id instanceof Types.ObjectId;
};

const transformUser = (user: unknown): TransformedUser => {
  if (!isPopulatedUser(user)) {
    throw new Error('Invalid user object');
  }
  return {
    _id: user._id.toString(),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || ''
  };
};

const isPopulatedComment = (comment: any): comment is IComment & { 
  _id: Types.ObjectId;
  author: IUser & { _id: Types.ObjectId };
} => {
  return comment && typeof comment.text === 'string' && 
         comment._id instanceof Types.ObjectId &&
         isPopulatedUser(comment.author);
};

const isPopulatedSubtask = (subtask: any): subtask is ISubTask & {
  _id: Types.ObjectId;
  comments?: Array<IComment & { 
    _id: Types.ObjectId;
    author: IUser & { _id: Types.ObjectId };
  }>;
} => {
  return subtask && typeof subtask.title === 'string' &&
         subtask._id instanceof Types.ObjectId &&
         (!subtask.comments || subtask.comments.every(isPopulatedComment));
};

const transformCommentWithReplies = (comment: any): TransformedComment => {
  console.log('Transforming comment with replies:', {
    id: comment._id?.toString() || comment.id,
    text: comment.text,
    parentComment: comment.parentComment?._id?.toString() || comment.parentComment,
    subtask: comment.subtask?._id?.toString() || comment.subtask,
    replies: comment.replies
  });

  return {
    id: comment._id?.toString() || comment.id,
    text: comment.text,
    author: transformUser(comment.author),
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    parentComment: comment.parentComment?._id?.toString() || comment.parentComment,
    isEdited: comment.isEdited || false,
    subtask: comment.subtask?._id?.toString() || comment.subtask,
    replies: comment.replies?.map(transformCommentWithReplies) || []
  };
};

const transformTask = (task: Document & ITask): TransformedTask => {
  // Type guard to ensure we have a valid task document
  const isValidTask = (doc: any): doc is PopulatedTask => {
    return doc && 
           doc._id instanceof mongoose.Types.ObjectId &&
           typeof doc.title === 'string' &&
           typeof doc.description === 'string' &&
           typeof doc.status === 'string' &&
           typeof doc.priority === 'string' &&
           doc.dueDate instanceof Date &&
           doc.createdBy &&
           Array.isArray(doc.participants) &&
           Array.isArray(doc.subtasks);
  };

  if (!isValidTask(task)) {
    throw new Error('Invalid task object');
  }

  const populatedTask = task as PopulatedTask;

  return {
    _id: populatedTask._id.toString(),
    title: populatedTask.title,
    description: populatedTask.description,
    status: populatedTask.status as 'in-progress' | 'completed' | 'expired' | 'closed',
    priority: populatedTask.priority as 'low' | 'medium' | 'high',
    dueDate: populatedTask.dueDate.toISOString(),
    assignedTo: populatedTask.assignedTo ? transformUser(populatedTask.assignedTo) : undefined,
    createdBy: transformUser(populatedTask.createdBy),
    createdAt: populatedTask.createdAt.toISOString(),
    updatedAt: populatedTask.updatedAt.toISOString(),
    progress: populatedTask.progress,
    participants: populatedTask.participants.map(transformUser),
    subtasks: populatedTask.subtasks.map(st => ({
      _id: st._id.toString(),
      title: st.title,
      description: st.description || '',
      status: st.status as 'in-progress' | 'completed' | 'expired' | 'closed',
      priority: st.priority as 'low' | 'medium' | 'high',
      dueDate: st.dueDate?.toISOString() || new Date().toISOString(),
      assignedTo: st.assignedTo ? transformUser(st.assignedTo) : undefined,
      createdBy: transformUser(st.createdBy),
      createdAt: st.createdAt.toISOString(),
      updatedAt: st.updatedAt.toISOString(),
      progress: st.progress || 0,
      comments: st.comments?.map(transformCommentWithReplies) || []
    }))
  };
};

export class TaskService {
  async createTask(taskData: Partial<ITask>): Promise<ITask> {
    try {
      const task = new Task(taskData);
      return await task.save();
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  async getTask(taskId: string): Promise<TransformedTask> {
    try {
      const task = await Task.findById(taskId)
        .populate('assignedTo')
        .populate('createdBy')
        .populate('participants')
        .populate({
          path: 'subtasks',
          populate: [
            { path: 'assignedTo' },
            { path: 'createdBy' },
            {
              path: 'comments',
              populate: [
                { path: 'author' },
                { path: 'replies', populate: { path: 'author' } }
              ]
            }
          ]
        });
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      return transformTask(task);
    } catch (error) {
      console.error('Error in getTask:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updateData: Partial<ITask>): Promise<ITask | null> {
    try {
      return await Task.findByIdAndUpdate(
        taskId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'firstName lastName email')
       .populate('createdBy', 'firstName lastName email');
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find the task and populate subtasks
      const task = await Task.findById(taskId)
        .populate('subtasks')
        .session(session);

      if (!task) {
        throw new Error('Task not found');
      }

      // 2. Get all subtask IDs
      const subtaskIds = task.subtasks.map(subtask => subtask._id);

      // 3. Delete all comments associated with the subtasks
      await Comment.deleteMany({
        subtask: { $in: subtaskIds }
      }).session(session);

      // 4. Delete all subtasks
      await SubTask.deleteMany({
        _id: { $in: subtaskIds }
      }).session(session);

      // 5. Delete the task itself
      await Task.findByIdAndDelete(taskId).session(session);

      // 6. Commit the transaction
      await session.commitTransaction();
      return true;

    } catch (error) {
      // If any error occurs, abort the transaction
      await session.abortTransaction();
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task and its associated data');
    } finally {
      // End the session
      session.endSession();
    }
  }

  async getTasksByUser(userId: string, status?: string): Promise<ITask[]> {
    try {
      const query: any = {
        $or: [
          { assignedTo: new Types.ObjectId(userId) },
          { createdBy: new Types.ObjectId(userId) }
        ]
      };
      if (status) {
        query.status = status;
      }
      return await Task.find(query)
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ dueDate: 1 });
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw new Error('Failed to fetch user tasks');
    }
  }

  async getTasksByStatus(status: string): Promise<ITask[]> {
    try {
      return await Task.find({ status })
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ priority: -1, dueDate: 1 });
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      throw new Error('Failed to fetch tasks by status');
    }
  }

  async searchTasks(query: string): Promise<ITask[]> {
    try {
      return await Task.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      })
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ priority: -1, dueDate: 1 });
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw new Error('Failed to search tasks');
    }
  }

  async getOverdueTasks(): Promise<ITask[]> {
    try {
      return await Task.find({
        status: { $ne: 'completed' },
        dueDate: { $lt: new Date() }
      })
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ dueDate: 1 });
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      throw new Error('Failed to fetch overdue tasks');
    }
  }

  // Task progress calculation
  async calculateTaskProgress(taskId: string): Promise<number> {
    try {
      const task = await Task.findById(taskId)
        .populate({
          path: 'subtasks',
          select: 'status progress'
        });

      if (!task || !task.subtasks || task.subtasks.length === 0) {
        return 0;
      }

      const totalProgress = task.subtasks.reduce(
        (sum: number, subtask: any) => sum + (subtask.progress || 0),
        0
      );

      const progress = Math.round(totalProgress / task.subtasks.length);
      
      // Update the task's progress
      await Task.findByIdAndUpdate(
        taskId,
        { $set: { progress } },
        { new: true }
      );
      
      return progress;
    } catch (error) {
      console.error('Error calculating task progress:', error);
      throw new Error('Failed to calculate task progress');
    }
  }

  // Task status management
  async updateTaskStatus(taskId: string, status: ITask['status']): Promise<ITask | null> {
    try {
      return await this.updateTask(taskId, { status });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  // Task assignment
  async assignTask(taskId: string, userId: string): Promise<ITask | null> {
    try {
      return await this.updateTask(taskId, { assignedTo: new Types.ObjectId(userId) });
    } catch (error) {
      console.error('Error assigning task:', error);
      throw new Error('Failed to assign task');
    }
  }

  async unassignTask(taskId: string, userId: string): Promise<TransformedTask | null> {
    try {
      const task = await this.getTask(taskId);
      if (!task) {
        return null;
      }

      // If the current assignee matches the userId, unassign the task
      if (task.assignedTo?._id === userId) {
        const updatedTask = await Task.findByIdAndUpdate(
          taskId,
          { $unset: { assignedTo: "" } },
          { new: true }
        )
          .populate('createdBy', 'firstName lastName email')
          .populate('assignedTo', 'firstName lastName email')
          .populate('participants', 'firstName lastName email')
          .populate('subtasks');

        if (!updatedTask) {
          throw new Error('Failed to unassign task');
        }

        return transformTask(updatedTask);
      }

      return task;
    } catch (error) {
      console.error('Error unassigning task:', error);
      throw new Error('Failed to unassign task');
    }
  }

  // Task filtering and sorting
  async getTasksByDueDate(startDate: string, endDate: string): Promise<ITask[]> {
    try {
      return await Task.find({
        dueDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ dueDate: 1 });
    } catch (error) {
      console.error('Error fetching tasks by due date:', error);
      throw new Error('Failed to fetch tasks by due date');
    }
  }

  // Task sorting
  async getTasksSorted(sortBy: keyof ITask, order: 'asc' | 'desc' = 'asc'): Promise<ITask[]> {
    try {
      const sortOrder = order === 'asc' ? 1 : -1;
      return await Task.find()
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ [sortBy]: sortOrder });
    } catch (error) {
      console.error('Error fetching sorted tasks:', error);
      throw new Error('Failed to fetch sorted tasks');
    }
  }

  // Add this method
  async createSubtask(taskId: string, subtaskData: ISubTaskInput, userId: string): Promise<ISubTask> {
    try {
      // First, verify the parent task exists
      const parentTask = await Task.findById(taskId);
      if (!parentTask) {
        throw new Error('Parent task not found');
      }

      // Create the subtask with the parent task reference and creator
      const newSubtask = new SubTask({
        ...subtaskData,
        task: taskId,
        createdBy: userId
      });

      // Save the subtask
      await newSubtask.save();

      // Add the subtask to the parent task's subtasks array
      parentTask.subtasks.push(newSubtask._id as mongoose.Types.ObjectId);
      await parentTask.save();

      return newSubtask;
    } catch (error) {
      console.error('Error creating subtask:', error);
      throw new Error('Failed to create subtask');
    }
  }

  async updateSubtask(taskId: string, subtaskId: string, updates: Partial<ISubTaskInput>): Promise<TransformedTask> {
    try {
      // Verify the task exists
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Verify the subtask exists and belongs to the task
      const subtask = await SubTask.findOne({ _id: subtaskId, task: taskId });
      if (!subtask) {
        throw new Error('Subtask not found');
      }

      // Update the subtask
      Object.assign(subtask, updates);
      await subtask.save();

      // If the status was updated, recalculate the task progress
      if (updates.status) {
        await this.calculateTaskProgress(taskId);
      }

      // Fetch the updated task with all populated fields
      const updatedTask = await Task.findById(taskId)
        .populate('assignedTo')
        .populate('createdBy')
        .populate('participants')
        .populate({
          path: 'subtasks',
          populate: [
            { path: 'assignedTo' },
            { path: 'createdBy' },
            {
              path: 'comments',
              populate: [
                { path: 'author' },
                { path: 'replies', populate: { path: 'author' } }
              ]
            }
          ]
        });

      if (!updatedTask) {
        throw new Error('Failed to fetch updated task');
      }

      return transformTask(updatedTask);
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw new Error('Failed to update subtask');
    }
  }

  async createComment(taskId: string, subtaskId: string, userId: string, text: string, parentCommentId?: string): Promise<TransformedTask> {
    try {
      // First, verify the task and subtask exist
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const subtask = await SubTask.findById(subtaskId);
      if (!subtask) {
        throw new Error('Subtask not found');
      }

      // Create the comment
      const comment = await Comment.create({
        text,
        author: new mongoose.Types.ObjectId(userId),
        subtask: new mongoose.Types.ObjectId(subtaskId),
        parentComment: parentCommentId ? new mongoose.Types.ObjectId(parentCommentId) : undefined
      });

      // Add the comment to the subtask's comments array
      if (!subtask.comments) {
        subtask.comments = [];
      }
      subtask.comments.push(comment._id as mongoose.Types.ObjectId);
      await subtask.save();

      // Fetch the updated task with all populated fields
      const updatedTask = await Task.findById(taskId)
        .populate('assignedTo')
        .populate('createdBy')
        .populate('participants')
        .populate({
          path: 'subtasks',
          populate: [
            { path: 'assignedTo' },
            { path: 'createdBy' },
            {
              path: 'comments',
              populate: [
                { path: 'author' },
                { path: 'replies', populate: { path: 'author' } }
              ]
            }
          ]
        });

      if (!updatedTask) {
        throw new Error('Failed to fetch updated task');
      }

      return transformTask(updatedTask);
    } catch (error) {
      console.error('Error creating comment:', error);
      throw new Error('Failed to create comment');
    }
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<TransformedTask> {
    try {
      // Verify the task exists
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Verify the subtask exists and belongs to the task
      const subtask = await SubTask.findOne({ _id: subtaskId, task: taskId });
      if (!subtask) {
        throw new Error('Subtask not found');
      }

      // Delete the subtask
      await SubTask.findByIdAndDelete(subtaskId);

      // Remove the subtask reference from the task
      task.subtasks = task.subtasks.filter(id => id.toString() !== subtaskId);
      await task.save();

      // Fetch the updated task with all populated fields
      const updatedTask = await Task.findById(taskId)
        .populate('assignedTo')
        .populate('createdBy')
        .populate('participants')
        .populate({
          path: 'subtasks',
          populate: [
            { path: 'assignedTo' },
            { path: 'createdBy' },
            {
              path: 'comments',
              populate: [
                { path: 'author' },
                { path: 'replies', populate: { path: 'author' } }
              ]
            }
          ]
        });

      if (!updatedTask) {
        throw new Error('Failed to fetch updated task');
      }

      return transformTask(updatedTask);
    } catch (error) {
      console.error('Error deleting subtask:', error);
      throw new Error('Failed to delete subtask');
    }
  }

  async updateSubTaskProgress(taskId: string, subtaskId: string, progress: number): Promise<TransformedTask> {
    try {
      // Update the subtask progress
      const subtask = await SubTask.findByIdAndUpdate(
        subtaskId,
        { $set: { progress } },
        { new: true }
      );

      if (!subtask) {
        throw new Error('Subtask not found');
      }

      // Recalculate the task's progress
      await this.calculateTaskProgress(taskId);

      // Fetch the updated task with all populated fields
      const updatedTask = await Task.findById(taskId)
        .populate('assignedTo')
        .populate('createdBy')
        .populate('participants')
        .populate({
          path: 'subtasks',
          select: 'title description status progress assignedTo createdBy comments',
          populate: [
            { path: 'assignedTo' },
            { path: 'createdBy' },
            {
              path: 'comments',
              populate: [
                { path: 'author' },
                { path: 'replies', populate: { path: 'author' } }
              ]
            }
          ]
        });

      if (!updatedTask) {
        throw new Error('Failed to fetch updated task');
      }

      return transformTask(updatedTask);
    } catch (error) {
      console.error('Error updating subtask progress:', error);
      throw new Error('Failed to update subtask progress');
    }
  }

  async addParticipant(taskId: string, participantId: string): Promise<TransformedTask> {
    try {
      // Validate ObjectIds
      if (!Types.ObjectId.isValid(taskId)) {
        throw new Error('Invalid task ID format');
      }
      if (!Types.ObjectId.isValid(participantId)) {
        throw new Error('Invalid participant ID format');
      }

      // First, verify the task exists
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Check if participant is already added
      if (task.participants.includes(new Types.ObjectId(participantId))) {
        throw new Error('User is already a participant');
      }

      // Add the participant
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { $addToSet: { participants: new Types.ObjectId(participantId) } },
        { 
          new: true,
          populate: [
            { path: 'assignedTo' },
            { path: 'createdBy' },
            { path: 'participants' },
            {
              path: 'subtasks',
              populate: [
                { path: 'assignedTo' },
                { path: 'createdBy' },
                {
                  path: 'comments',
                  populate: [
                    { path: 'author' },
                    { path: 'replies', populate: { path: 'author' } }
                  ]
                }
              ]
            }
          ]
        }
      );

      if (!updatedTask) {
        throw new Error('Task not found');
      }

      return transformTask(updatedTask);
    } catch (error) {
      console.error('Error adding participant:', error);
      if (error instanceof Error) {
        if (error.message.includes('ObjectId')) {
          throw new Error('Invalid ID format');
        }
      }
      throw error;
    }
  }

  async removeParticipant(taskId: string, participantId: string): Promise<TransformedTask> {
    try {
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { $pull: { participants: new Types.ObjectId(participantId) } },
        { 
          new: true,
          populate: [
            { path: 'assignedTo' },
            { path: 'createdBy' },
            { path: 'participants' },
            {
              path: 'subtasks',
              populate: [
                { path: 'assignedTo' },
                { path: 'createdBy' },
                {
                  path: 'comments',
                  populate: [
                    { path: 'author' },
                    { path: 'replies', populate: { path: 'author' } }
                  ]
                }
              ]
            }
          ]
        }
      );

      if (!updatedTask) {
        throw new Error('Task not found');
      }

      return transformTask(updatedTask);
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }
} 