import { Router } from 'express';

import type { CompleteTask } from '../application/use-cases/complete-task.ts';
import type { CreateTask } from '../application/use-cases/create-task.ts';
import type { GetTask } from '../application/use-cases/get-task.ts';
import type { ListTasks } from '../application/use-cases/list-tasks.ts';

import { makeCompleteTaskController } from './controllers/complete-task-controller.ts';
import { makeCreateTaskController } from './controllers/create-task-controller.ts';
import { makeGetTaskController } from './controllers/get-task-controller.ts';
import { makeListTasksController } from './controllers/list-tasks-controller.ts';

export interface TasksRouterDependencies {
  completeTask: CompleteTask;
  createTask: CreateTask;
  getTask: GetTask;
  listTasks: ListTasks;
}

export const makeTasksRouter = ({
  completeTask,
  createTask,
  getTask,
  listTasks,
}: TasksRouterDependencies): Router => {
  const router = Router();

  router.get('/', makeListTasksController({ listTasks }));
  router.post('/', makeCreateTaskController({ createTask }));
  router.get('/:id', makeGetTaskController({ getTask }));
  router.post('/:id/complete', makeCompleteTaskController({ completeTask }));

  return router;
};
