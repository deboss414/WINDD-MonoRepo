import { Task } from './task.types';

/**
 * Calculates the progress of a task based on its subtasks
 * @param task The task to calculate progress for
 * @returns A number between 0 and 100 representing the percentage of completed subtasks
 */
export const calculateTaskProgress = (task: Task): number => {
  if (!task.subtasks || task.subtasks.length === 0) {
    return 0;
  }

  const completedSubtasks = task.subtasks.filter(
    subtask => subtask.status === 'completed'
  ).length;

  return Math.round((completedSubtasks / task.subtasks.length) * 100);
}; 