import { describe, expect, it } from 'vitest';

import { InvalidTaskTitleError } from '../errors/invalid-task-title-error.ts';
import { TaskAlreadyCompletedError } from '../errors/task-already-completed-error.ts';
import { completeTask, createTask, type Task } from './task.ts';

describe('createTask', () => {
  it('creates an incomplete task with a trimmed title', () => {
    expect(createTask({ id: 'task-1', title: '  Write tests  ' })).toEqual({
      ok: true,
      value: { completed: false, id: 'task-1', title: 'Write tests' },
    });
  });

  it('accepts a title of 200 characters', () => {
    expect(createTask({ id: 'task-1', title: 'a'.repeat(200) }).ok).toBe(true);
  });

  it('measures the title after trimming it', () => {
    expect(createTask({ id: 'task-1', title: ` ${'a'.repeat(200)} ` }).ok).toBe(
      true,
    );
  });

  it.each(['', '   ', 'a'.repeat(201)])(
    'returns InvalidTaskTitleError for an invalid title (%j)',
    (title) => {
      expect(createTask({ id: 'task-1', title })).toEqual({
        error: new InvalidTaskTitleError(200),
        ok: false,
      });
    },
  );
});

describe('completeTask', () => {
  const task: Task = { completed: false, id: 'task-1', title: 'Write tests' };

  it('completes the task without changing the original', () => {
    expect(completeTask(task)).toEqual({
      ok: true,
      value: { ...task, completed: true },
    });
    expect(task.completed).toBe(false);
  });

  it('returns TaskAlreadyCompletedError for a completed task', () => {
    expect(completeTask({ ...task, completed: true })).toEqual({
      error: new TaskAlreadyCompletedError('task-1'),
      ok: false,
    });
  });
});
