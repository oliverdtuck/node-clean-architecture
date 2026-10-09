import type { Task } from '../entities/task.ts';

export interface TaskRepository {
  findAll: () => Promise<Task[]>;
  findById: (id: string) => Promise<Task | undefined>;
  save: (task: Task) => Promise<void>;
}
