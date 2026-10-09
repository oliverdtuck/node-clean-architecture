import type { Result } from '../../../../shared/result.ts';
import type { InvalidTaskTitleError } from '../../domain/errors/invalid-task-title-error.ts';
import type { TaskRepository } from '../../domain/repositories/task-repository.ts';

import { createTask, type Task } from '../../domain/entities/task.ts';

export type CreateTask = (
  command: CreateTaskCommand,
) => Promise<Result<Task, CreateTaskError>>;

export interface CreateTaskCommand {
  title: string;
}

export interface CreateTaskDependencies {
  generateId: () => string;
  taskRepository: TaskRepository;
}

export type CreateTaskError = InvalidTaskTitleError;

export const makeCreateTask =
  ({ generateId, taskRepository }: CreateTaskDependencies): CreateTask =>
  async ({ title }) => {
    const result = createTask({ id: generateId(), title });

    if (result.ok) {
      await taskRepository.save(result.value);
    }

    return result;
  };
