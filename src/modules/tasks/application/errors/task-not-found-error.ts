export class TaskNotFoundError extends Error {
  readonly code = 'TASK_NOT_FOUND';
  override readonly name = 'TaskNotFoundError';

  constructor(id: string) {
    super(`Task ${id} not found`);
  }
}
