import type { RequestHandler } from 'express';

import { z } from 'zod';

import type {
  CreateTask,
  CreateTaskError,
} from '../../application/use-cases/create-task.ts';

import { toTaskDto } from '../dtos/task-dto.ts';

const requestSchema = z.object({
  body: z.object({ title: z.string() }),
});

const statusByErrorCode: Record<CreateTaskError['code'], number> = {
  INVALID_TASK_TITLE: 422,
};

export interface CreateTaskControllerDependencies {
  createTask: CreateTask;
}

export const makeCreateTaskController =
  ({ createTask }: CreateTaskControllerDependencies): RequestHandler =>
  async (req, res) => {
    const request = requestSchema.safeParse(req);

    if (!request.success) {
      res
        .status(400)
        .json({ error: 'Invalid request', issues: request.error.issues });
      return;
    }

    const result = await createTask({ title: request.data.body.title });

    if (!result.ok) {
      res
        .status(statusByErrorCode[result.error.code])
        .json({ error: result.error.message });
      return;
    }

    res.status(201).json(toTaskDto(result.value));
  };
