import type { Task } from '../../domain/entities/task.ts';
import type { TaskRepository } from '../../domain/repositories/task-repository.ts';

export type ListTasks = () => Promise<Task[]>;

export interface ListTasksDependencies {
  taskRepository: TaskRepository;
}

export const makeListTasks =
  ({ taskRepository }: ListTasksDependencies): ListTasks =>
  () =>
    taskRepository.findAll();
