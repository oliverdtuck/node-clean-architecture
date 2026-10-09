import type { Task } from '../../domain/entities/task.ts';
import type { TaskRepository } from '../../domain/repositories/task-repository.ts';

export const makeInMemoryTaskRepository = (): TaskRepository => {
  const tasks = new Map<string, Task>();

  return {
    findAll: () => Promise.resolve([...tasks.values()]),
    findById: (id) => Promise.resolve(tasks.get(id)),
    save: (task) => {
      tasks.set(task.id, task);
      return Promise.resolve();
    },
  };
};
