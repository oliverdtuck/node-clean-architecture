import { describe, expect, it } from 'vitest';

import type { Task } from '../../domain/entities/task.ts';

import { makeInMemoryTaskRepository } from '../../infrastructure/database/in-memory-task-repository.ts';
import { makeListTasks } from './list-tasks.ts';

const task: Task = { completed: false, id: 'task-1', title: 'Write tests' };

describe('makeListTasks', () => {
  it('returns an empty list when there are no tasks', async () => {
    const listTasks = makeListTasks({
      taskRepository: makeInMemoryTaskRepository(),
    });

    await expect(listTasks()).resolves.toEqual([]);
  });

  it('returns every task', async () => {
    const taskRepository = makeInMemoryTaskRepository();
    await taskRepository.save(task);

    await expect(makeListTasks({ taskRepository })()).resolves.toEqual([task]);
  });
});
