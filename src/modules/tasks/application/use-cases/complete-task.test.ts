import { describe, expect, it } from 'vitest';

import type { Task } from '../../domain/entities/task.ts';

import { TaskAlreadyCompletedError } from '../../domain/errors/task-already-completed-error.ts';
import { makeInMemoryTaskRepository } from '../../infrastructure/database/in-memory-task-repository.ts';
import { TaskNotFoundError } from '../errors/task-not-found-error.ts';
import { makeCompleteTask } from './complete-task.ts';

const task: Task = { completed: false, id: 'task-1', title: 'Write tests' };

const setup = async ({ completed = false } = {}) => {
  const taskRepository = makeInMemoryTaskRepository();
  await taskRepository.save({ ...task, completed });
  return { completeTask: makeCompleteTask({ taskRepository }), taskRepository };
};

describe('makeCompleteTask', () => {
  it('completes and saves the task', async () => {
    const { completeTask, taskRepository } = await setup();

    await expect(completeTask({ id: 'task-1' })).resolves.toEqual({
      ok: true,
      value: { ...task, completed: true },
    });
    await expect(taskRepository.findById('task-1')).resolves.toEqual({
      ...task,
      completed: true,
    });
  });

  it('returns TaskAlreadyCompletedError for a completed task', async () => {
    const { completeTask } = await setup({ completed: true });

    await expect(completeTask({ id: 'task-1' })).resolves.toEqual({
      error: new TaskAlreadyCompletedError('task-1'),
      ok: false,
    });
  });

  it('returns TaskNotFoundError for an unknown id', async () => {
    const { completeTask } = await setup();

    await expect(completeTask({ id: 'unknown' })).resolves.toEqual({
      error: new TaskNotFoundError('unknown'),
      ok: false,
    });
  });
});
