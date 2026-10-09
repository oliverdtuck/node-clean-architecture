import { describe, expect, it } from 'vitest';

import type { Task } from '../../domain/entities/task.ts';

import { makeInMemoryTaskRepository } from '../../infrastructure/database/in-memory-task-repository.ts';
import { TaskNotFoundError } from '../errors/task-not-found-error.ts';
import { makeGetTask } from './get-task.ts';

const task: Task = { completed: false, id: 'task-1', title: 'Write tests' };

const setup = async () => {
  const taskRepository = makeInMemoryTaskRepository();
  await taskRepository.save(task);
  return { getTask: makeGetTask({ taskRepository }) };
};

describe('makeGetTask', () => {
  it('returns the task', async () => {
    const { getTask } = await setup();

    await expect(getTask({ id: 'task-1' })).resolves.toEqual({
      ok: true,
      value: task,
    });
  });

  it('returns TaskNotFoundError for an unknown id', async () => {
    const { getTask } = await setup();

    await expect(getTask({ id: 'unknown' })).resolves.toEqual({
      error: new TaskNotFoundError('unknown'),
      ok: false,
    });
  });
});
