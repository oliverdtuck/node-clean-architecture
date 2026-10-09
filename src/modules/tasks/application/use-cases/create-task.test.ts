import { describe, expect, it } from 'vitest';

import { InvalidTaskTitleError } from '../../domain/errors/invalid-task-title-error.ts';
import { makeInMemoryTaskRepository } from '../../infrastructure/database/in-memory-task-repository.ts';
import { makeCreateTask } from './create-task.ts';

const setup = () => {
  const taskRepository = makeInMemoryTaskRepository();
  const createTask = makeCreateTask({
    generateId: () => 'task-1',
    taskRepository,
  });
  return { createTask, taskRepository };
};

describe('makeCreateTask', () => {
  it('saves the task and returns it', async () => {
    const { createTask, taskRepository } = setup();
    const task = { completed: false, id: 'task-1', title: 'Write tests' };

    await expect(createTask({ title: 'Write tests' })).resolves.toEqual({
      ok: true,
      value: task,
    });
    await expect(taskRepository.findById('task-1')).resolves.toEqual(task);
  });

  it('returns InvalidTaskTitleError and saves nothing for an invalid title', async () => {
    const { createTask, taskRepository } = setup();

    await expect(createTask({ title: ' ' })).resolves.toEqual({
      error: new InvalidTaskTitleError(200),
      ok: false,
    });
    await expect(taskRepository.findAll()).resolves.toEqual([]);
  });
});
