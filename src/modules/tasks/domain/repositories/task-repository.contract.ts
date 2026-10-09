import { expect, it } from 'vitest';

import type { Task } from '../entities/task.ts';
import type { TaskRepository } from './task-repository.ts';

const firstTask: Task = {
  completed: false,
  id: '00000000-0000-4000-8000-000000000001',
  title: 'First',
};
const secondTask: Task = {
  completed: false,
  id: '00000000-0000-4000-8000-000000000002',
  title: 'Second',
};

/** The behaviour every TaskRepository must have. Call it inside each implementation's describe block. */
export const testTaskRepositoryContract = (
  makeTaskRepository: () => TaskRepository,
): void => {
  it('returns undefined for an unknown id', async () => {
    await expect(
      makeTaskRepository().findById(firstTask.id),
    ).resolves.toBeUndefined();
  });

  it('finds a saved task by id', async () => {
    const taskRepository = makeTaskRepository();
    await taskRepository.save(firstTask);

    await expect(taskRepository.findById(firstTask.id)).resolves.toEqual(
      firstTask,
    );
  });

  it('replaces a task saved again with the same id', async () => {
    const taskRepository = makeTaskRepository();
    await taskRepository.save(firstTask);
    await taskRepository.save({ ...firstTask, completed: true });

    await expect(taskRepository.findById(firstTask.id)).resolves.toEqual({
      ...firstTask,
      completed: true,
    });
  });

  it('lists every saved task', async () => {
    const taskRepository = makeTaskRepository();
    await taskRepository.save(firstTask);
    await taskRepository.save(secondTask);

    const tasks = await taskRepository.findAll();

    // The interface promises no order, so neither does the test
    expect(tasks).toHaveLength(2);
    expect(tasks).toEqual(expect.arrayContaining([firstTask, secondTask]));
  });
};
