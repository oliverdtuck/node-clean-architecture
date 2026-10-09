import { Router } from 'express';
import { pino } from 'pino';
import request from 'supertest';
import { describe, it } from 'vitest';

import type { ListTasks } from '../../application/use-cases/list-tasks.ts';

import { makeApp } from '../../../../app.ts';
import { makeListTasksController } from './list-tasks-controller.ts';

const task = { completed: false, id: 'task-1', title: 'Write tests' };

const setup = (listTasks: ListTasks) =>
  makeApp({
    logger: pino({ level: 'silent' }),
    routers: {
      '/tasks': Router().get('/', makeListTasksController({ listTasks })),
    },
  });

describe('makeListTasksController', () => {
  it('returns 200 with every task', async () => {
    await request(setup(() => Promise.resolve([task])))
      .get('/tasks')
      .expect(200, [task]);
  });
});
