export class TaskAlreadyCompletedError extends Error {
  readonly code = 'TASK_ALREADY_COMPLETED';
  override readonly name = 'TaskAlreadyCompletedError';

  constructor(id: string) {
    super(`Task ${id} is already completed`);
  }
}
