import { Router } from 'express';
import { pino } from 'pino';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import type { GetTask } from '../../application/use-cases/get-task.ts';

import { makeApp } from '../../../../app.ts';
import { err, ok } from '../../../../shared/result.ts';
import { TaskNotFoundError } from '../../application/errors/task-not-found-error.ts';
import { makeGetTaskController } from './get-task-controller.ts';

const id = '00000000-0000-4000-8000-000000000001';
const task = { completed: false, id, title: 'Write tests' };

const setup = (getTask: GetTask) =>
  makeApp({
    logger: pino({ level: 'silent' }),
    routers: {
      '/tasks': Router().get('/:id', makeGetTaskController({ getTask })),
    },
  });

describe('makeGetTaskController', () => {
  it('returns 200 with the task', async () => {
    const getTask = vi.fn<GetTask>(() => Promise.resolve(ok(task)));

    await request(setup(getTask)).get(`/tasks/${id}`).expect(200, task);
    expect(getTask).toHaveBeenCalledExactlyOnceWith({ id });
  });

  it('returns 400 when the id is not a UUID', async () => {
    const getTask = vi.fn<GetTask>();

    const response = await request(setup(getTask))
      .get('/tasks/task-1')
      .expect(400);

    expect(response.body).toMatchObject({
      issues: [{ path: ['params', 'id'] }],
    });
    expect(getTask).not.toHaveBeenCalled();
  });

  it('returns 404 for TaskNotFoundError', async () => {
    const error = new TaskNotFoundError(id);

    await request(setup(() => Promise.resolve(err(error))))
      .get(`/tasks/${id}`)
      .expect(404, { error: error.message });
  });
});
