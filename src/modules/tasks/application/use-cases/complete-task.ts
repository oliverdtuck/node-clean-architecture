import type { TaskAlreadyCompletedError } from '../../domain/errors/task-already-completed-error.ts';
import type { TaskRepository } from '../../domain/repositories/task-repository.ts';

import { err, type Result } from '../../../../shared/result.ts';
import { completeTask, type Task } from '../../domain/entities/task.ts';
import { TaskNotFoundError } from '../errors/task-not-found-error.ts';

export type CompleteTask = (
  command: CompleteTaskCommand,
) => Promise<Result<Task, CompleteTaskError>>;

export interface CompleteTaskCommand {
  id: string;
}

export interface CompleteTaskDependencies {
  taskRepository: TaskRepository;
}

export type CompleteTaskError = TaskAlreadyCompletedError | TaskNotFoundError;

export const makeCompleteTask =
  ({ taskRepository }: CompleteTaskDependencies): CompleteTask =>
  async ({ id }) => {
    const task = await taskRepository.findById(id);

    if (!task) {
      return err(new TaskNotFoundError(id));
    }

    const result = completeTask(task);

    if (result.ok) {
      await taskRepository.save(result.value);
    }

    return result;
  };
