import express from 'express';
import { TaskController } from '../controllers/TaskController';
import auth from '../middleware/auth';

const router = express.Router();
const taskController = new TaskController();

// Apply authentication middleware to all task routes
router.use(auth);

// Task queries
router.get('/user/:userId?', taskController.getTasksByUser.bind(taskController));
router.get('/status/:status', taskController.getTasksByStatus.bind(taskController));
router.get('/search', taskController.searchTasks.bind(taskController));
router.get('/overdue', taskController.getOverdueTasks.bind(taskController));
router.get('/due-date', taskController.getTasksByDueDate.bind(taskController));
router.get('/sort', taskController.getTasksSorted.bind(taskController));

// Task CRUD operations
router.post('/', taskController.createTask.bind(taskController));
router.get('/:id', taskController.getTask.bind(taskController));
router.put('/:id', taskController.updateTask.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));

// Task progress calculation
router.post('/:id/progress', taskController.calculateTaskProgress.bind(taskController));

// Task status management
router.put('/:id/status', taskController.updateTaskStatus.bind(taskController));

// Task assignment
router.post('/:id/assign', taskController.assignTask.bind(taskController));
router.delete('/:id/assign', taskController.unassignTask.bind(taskController));

// Subtask creation
router.post('/:taskId/subtasks', taskController.createSubtask.bind(taskController));
router.put('/:taskId/subtasks/:subtaskId', taskController.updateSubtask.bind(taskController));
router.delete('/:taskId/subtasks/:subtaskId', taskController.deleteSubtask.bind(taskController));
router.post('/:taskId/subtasks/:subtaskId/comments', taskController.createComment.bind(taskController));

// Subtask progress update
router.put('/:taskId/subtasks/:subtaskId/progress', taskController.updateSubTaskProgress.bind(taskController));

// Participant management routes
router.post('/:taskId/participants', taskController.addParticipant);
router.delete('/:taskId/participants/:participantId', taskController.removeParticipant);

export default router; 