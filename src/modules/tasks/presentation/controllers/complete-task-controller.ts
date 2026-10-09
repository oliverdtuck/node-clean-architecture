import type { RequestHandler } from 'express';

import { z } from 'zod';

import type {
  CompleteTask,
  CompleteTaskError,
} from '../../application/use-cases/complete-task.ts';

import { toTaskDto } from '../dtos/task-dto.ts';

const requestSchema = z.object({
  params: z.object({ id: z.uuid() }),
});

const statusByErrorCode: Record<CompleteTaskError['code'], number> = {
  TASK_ALREADY_COMPLETED: 422,
  TASK_NOT_FOUND: 404,
};

export interface CompleteTaskControllerDependencies {
  completeTask: CompleteTask;
}

export const makeCompleteTaskController =
  ({ completeTask }: CompleteTaskControllerDependencies): RequestHandler =>
  async (req, res) => {
    const request = requestSchema.safeParse(req);

    if (!request.success) {
      res
        .status(400)
        .json({ error: 'Invalid request', issues: request.error.issues });
      return;
    }

    const result = await completeTask({ id: request.data.params.id });

    if (!result.ok) {
      res
        .status(statusByErrorCode[result.error.code])
        .json({ error: result.error.message });
      return;
    }

    res.json(toTaskDto(result.value));
  };
