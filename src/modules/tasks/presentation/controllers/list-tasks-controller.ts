import type { RequestHandler } from 'express';

import type { ListTasks } from '../../application/use-cases/list-tasks.ts';

import { toTaskDto } from '../dtos/task-dto.ts';

export interface ListTasksControllerDependencies {
  listTasks: ListTasks;
}

export const makeListTasksController =
  ({ listTasks }: ListTasksControllerDependencies): RequestHandler =>
  async (_req, res) => {
    const tasks = await listTasks();
    res.json(tasks.map(toTaskDto));
  };
