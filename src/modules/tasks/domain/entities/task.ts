import { err, ok, type Result } from '../../../../shared/result.ts';
import { InvalidTaskTitleError } from '../errors/invalid-task-title-error.ts';
import { TaskAlreadyCompletedError } from '../errors/task-already-completed-error.ts';

export interface Task {
  readonly completed: boolean;
  readonly id: string;
  readonly title: string;
}

const MAX_TITLE_LENGTH = 200;

export const createTask = ({
  id,
  title,
}: Pick<Task, 'id' | 'title'>): Result<Task, InvalidTaskTitleError> => {
  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0 || trimmedTitle.length > MAX_TITLE_LENGTH) {
    return err(new InvalidTaskTitleError(MAX_TITLE_LENGTH));
  }

  return ok({ completed: false, id, title: trimmedTitle });
};

export const completeTask = (
  task: Task,
): Result<Task, TaskAlreadyCompletedError> => {
  if (task.completed) {
    return err(new TaskAlreadyCompletedError(task.id));
  }

  return ok({ ...task, completed: true });
};
