import type { Task } from '../../domain/entities/task.ts';

/** The public JSON shape of a task, so domain changes don't reach clients by accident. */
export interface TaskDto {
  completed: boolean;
  id: string;
  title: string;
}

export const toTaskDto = (task: Task): TaskDto => ({
  completed: task.completed,
  id: task.id,
  title: task.title,
});
