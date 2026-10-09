export class InvalidTaskTitleError extends Error {
  readonly code = 'INVALID_TASK_TITLE';
  override readonly name = 'InvalidTaskTitleError';

  constructor(maxLength: number) {
    super(`Task title must be between 1 and ${String(maxLength)} characters`);
  }
}
