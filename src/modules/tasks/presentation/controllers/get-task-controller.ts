import type { RequestHandler } from 'express';

import { z } from 'zod';

import type {
  GetTask,
  GetTaskError,
} from '../../application/use-cases/get-task.ts';

import { toTaskDto } from '../dtos/task-dto.ts';

const requestSchema = z.object({
  params: z.object({ id: z.uuid() }),
});

const statusByErrorCode: Record<GetTaskError['code'], number> = {
  TASK_NOT_FOUND: 404,
};

export interface GetTaskControllerDependencies {
  getTask: GetTask;
}

export const makeGetTaskController =
  ({ getTask }: GetTaskControllerDependencies): RequestHandler =>
  async (req, res) => {
    const request = requestSchema.safeParse(req);

    if (!request.success) {
      res
        .status(400)
        .json({ error: 'Invalid request', issues: request.error.issues });
      return;
    }

    const result = await getTask({ id: request.data.params.id });

    if (!result.ok) {
      res
        .status(statusByErrorCode[result.error.code])
        .json({ error: result.error.message });
      return;
    }

    res.json(toTaskDto(result.value));
  };
