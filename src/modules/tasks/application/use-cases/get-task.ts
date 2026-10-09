import type { Task } from '../../domain/entities/task.ts';
import type { TaskRepository } from '../../domain/repositories/task-repository.ts';

import { err, ok, type Result } from '../../../../shared/result.ts';
import { TaskNotFoundError } from '../errors/task-not-found-error.ts';

export type GetTask = (
  query: GetTaskQuery,
) => Promise<Result<Task, GetTaskError>>;

export interface GetTaskDependencies {
  taskRepository: TaskRepository;
}

export type GetTaskError = TaskNotFoundError;

export interface GetTaskQuery {
  id: string;
}

export const makeGetTask =
  ({ taskRepository }: GetTaskDependencies): GetTask =>
  async ({ id }) => {
    const task = await taskRepository.findById(id);

    return task ? ok(task) : err(new TaskNotFoundError(id));
  };
