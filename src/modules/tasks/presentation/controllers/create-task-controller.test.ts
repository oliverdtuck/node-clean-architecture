import { Router } from 'express';
import { pino } from 'pino';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import type { CreateTask } from '../../application/use-cases/create-task.ts';

import { makeApp } from '../../../../app.ts';
import { err, ok } from '../../../../shared/result.ts';
import { InvalidTaskTitleError } from '../../domain/errors/invalid-task-title-error.ts';
import { makeCreateTaskController } from './create-task-controller.ts';

const task = { completed: false, id: 'task-1', title: 'Write tests' };

const setup = (createTask: CreateTask) =>
  makeApp({
    logger: pino({ level: 'silent' }),
    routers: {
      '/tasks': Router().post('/', makeCreateTaskController({ createTask })),
    },
  });

describe('makeCreateTaskController', () => {
  it('returns 201 with the created task', async () => {
    const createTask = vi.fn<CreateTask>(() => Promise.resolve(ok(task)));

    await request(setup(createTask))
      .post('/tasks')
      .send({ title: 'Write tests' })
      .expect(201, task);
    expect(createTask).toHaveBeenCalledExactlyOnceWith({
      title: 'Write tests',
    });
  });

  it('returns 400 with the issue path when the title is missing', async () => {
    const createTask = vi.fn<CreateTask>();

    const response = await request(setup(createTask))
      .post('/tasks')
      .send({})
      .expect(400);

    expect(response.body).toMatchObject({
      error: 'Invalid request',
      issues: [{ path: ['body', 'title'] }],
    });
    expect(createTask).not.toHaveBeenCalled();
  });

  it('returns 422 for InvalidTaskTitleError', async () => {
    const error = new InvalidTaskTitleError(200);

    await request(setup(() => Promise.resolve(err(error))))
      .post('/tasks')
      .send({ title: ' ' })
      .expect(422, { error: error.message });
  });
});
