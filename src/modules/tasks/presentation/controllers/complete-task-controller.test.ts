import { Router } from 'express';
import { pino } from 'pino';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import type { CompleteTask } from '../../application/use-cases/complete-task.ts';

import { makeApp } from '../../../../app.ts';
import { err, ok } from '../../../../shared/result.ts';
import { TaskNotFoundError } from '../../application/errors/task-not-found-error.ts';
import { TaskAlreadyCompletedError } from '../../domain/errors/task-already-completed-error.ts';
import { makeCompleteTaskController } from './complete-task-controller.ts';

const id = '00000000-0000-4000-8000-000000000001';
const task = { completed: true, id, title: 'Write tests' };

const setup = (completeTask: CompleteTask) =>
  makeApp({
    logger: pino({ level: 'silent' }),
    routers: {
      '/tasks': Router().post(
        '/:id/complete',
        makeCompleteTaskController({ completeTask }),
      ),
    },
  });

describe('makeCompleteTaskController', () => {
  it('returns 200 with the completed task', async () => {
    const completeTask = vi.fn<CompleteTask>(() => Promise.resolve(ok(task)));

    await request(setup(completeTask))
      .post(`/tasks/${id}/complete`)
      .expect(200, task);
    expect(completeTask).toHaveBeenCalledExactlyOnceWith({ id });
  });

  it('returns 400 when the id is not a UUID', async () => {
    const completeTask = vi.fn<CompleteTask>();

    const response = await request(setup(completeTask))
      .post('/tasks/task-1/complete')
      .expect(400);

    expect(response.body).toMatchObject({
      issues: [{ path: ['params', 'id'] }],
    });
    expect(completeTask).not.toHaveBeenCalled();
  });

  it('returns 422 for TaskAlreadyCompletedError', async () => {
    const error = new TaskAlreadyCompletedError(id);

    await request(setup(() => Promise.resolve(err(error))))
      .post(`/tasks/${id}/complete`)
      .expect(422, { error: error.message });
  });

  it('returns 404 for TaskNotFoundError', async () => {
    const error = new TaskNotFoundError(id);

    await request(setup(() => Promise.resolve(err(error))))
      .post(`/tasks/${id}/complete`)
      .expect(404, { error: error.message });
  });
});
