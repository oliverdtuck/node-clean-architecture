import { randomUUID } from 'node:crypto';
import { pino } from 'pino';

import { makeApp } from './app.ts';
import { loadConfig } from './config.ts';
import { makeCompleteTask } from './modules/tasks/application/use-cases/complete-task.ts';
import { makeCreateTask } from './modules/tasks/application/use-cases/create-task.ts';
import { makeGetTask } from './modules/tasks/application/use-cases/get-task.ts';
import { makeListTasks } from './modules/tasks/application/use-cases/list-tasks.ts';
import { makeInMemoryTaskRepository } from './modules/tasks/infrastructure/database/in-memory-task-repository.ts';
import { makeTasksRouter } from './modules/tasks/presentation/tasks-router.ts';

const config = loadConfig();
const logger = pino({ level: config.logLevel });

const taskRepository = makeInMemoryTaskRepository();

const tasksRouter = makeTasksRouter({
  completeTask: makeCompleteTask({ taskRepository }),
  createTask: makeCreateTask({ generateId: randomUUID, taskRepository }),
  getTask: makeGetTask({ taskRepository }),
  listTasks: makeListTasks({ taskRepository }),
});

const app = makeApp({ logger, routers: { '/tasks': tasksRouter } });

const server = app.listen(config.port, (error) => {
  if (error) {
    logger.fatal({ err: error }, 'Failed to start');
    process.exitCode = 1;
    return;
  }

  logger.info({ port: config.port }, 'Listening');
});

const shutdown = (signal: NodeJS.Signals) => {
  logger.info({ signal }, 'Shutting down');

  server.close((error) => {
    if (error) {
      logger.error({ err: error }, 'Failed to shut down cleanly');
      process.exitCode = 1;
    }
  });
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
