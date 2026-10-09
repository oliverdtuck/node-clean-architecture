import { describe, expect, it } from 'vitest';

import type { Task } from '../../domain/entities/task.ts';

import { makeInMemoryTaskRepository } from './in-memory-task-repository.ts';

const firstTask: Task = { completed: false, id: 'task-1', title: 'First' };
const secondTask: Task = { completed: false, id: 'task-2', title: 'Second' };

describe('makeInMemoryTaskRepository', () => {
  it('returns undefined for an unknown id', async () => {
    await expect(
      makeInMemoryTaskRepository().findById('unknown'),
    ).resolves.toBeUndefined();
  });

  it('finds a saved task by id', async () => {
    const taskRepository = makeInMemoryTaskRepository();
    await taskRepository.save(firstTask);

    await expect(taskRepository.findById('task-1')).resolves.toEqual(firstTask);
  });

  it('replaces a task saved again with the same id', async () => {
    const taskRepository = makeInMemoryTaskRepository();
    await taskRepository.save(firstTask);
    await taskRepository.save({ ...firstTask, completed: true });

    await expect(taskRepository.findById('task-1')).resolves.toEqual({
      ...firstTask,
      completed: true,
    });
  });

  it('lists every saved task', async () => {
    const taskRepository = makeInMemoryTaskRepository();
    await taskRepository.save(firstTask);
    await taskRepository.save(secondTask);

    const tasks = await taskRepository.findAll();

    // The interface promises no order, so neither does the test
    expect(tasks).toHaveLength(2);
    expect(tasks).toEqual(expect.arrayContaining([firstTask, secondTask]));
  });
});
