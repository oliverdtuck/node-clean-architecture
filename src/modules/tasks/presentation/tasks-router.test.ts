import { pino } from 'pino';
import request from 'supertest';
import { describe, it } from 'vitest';

import { makeApp } from '../../../app.ts';
import { makeCompleteTask } from '../application/use-cases/complete-task.ts';
import { makeCreateTask } from '../application/use-cases/create-task.ts';
import { makeGetTask } from '../application/use-cases/get-task.ts';
import { makeListTasks } from '../application/use-cases/list-tasks.ts';
import { makeInMemoryTaskRepository } from '../infrastructure/database/in-memory-task-repository.ts';
import { makeTasksRouter } from './tasks-router.ts';

const id = '00000000-0000-4000-8000-000000000001';

/** The tasks router on real use cases, with an in-memory repository. */
const setup = () => {
  const taskRepository = makeInMemoryTaskRepository();

  return makeApp({
    logger: pino({ level: 'silent' }),
    routers: {
      '/tasks': makeTasksRouter({
        completeTask: makeCompleteTask({ taskRepository }),
        createTask: makeCreateTask({ generateId: () => id, taskRepository }),
        getTask: makeGetTask({ taskRepository }),
        listTasks: makeListTasks({ taskRepository }),
      }),
    },
  });
};

describe('makeTasksRouter', () => {
  it('creates, reads, lists and completes a task', async () => {
    const app = setup();
    const task = { completed: false, id, title: 'Write tests' };

    await request(app)
      .post('/tasks')
      .send({ title: '  Write tests  ' })
      .expect(201, task);
    await request(app).get(`/tasks/${id}`).expect(200, task);
    await request(app).get('/tasks').expect(200, [task]);
    await request(app)
      .post(`/tasks/${id}/complete`)
      .expect(200, { ...task, completed: true });
  });

  it('rejects completing a task twice', async () => {
    const app = setup();
    await request(app)
      .post('/tasks')
      .send({ title: 'Write tests' })
      .expect(201);
    await request(app).post(`/tasks/${id}/complete`).expect(200);

    await request(app).post(`/tasks/${id}/complete`).expect(422);
  });

  it('returns 404 for an unknown task', async () => {
    await request(setup()).get(`/tasks/${id}`).expect(404);
  });
});
