import type { Pool } from 'pg';

import type { Task } from '../../domain/entities/task.ts';
import type { TaskRepository } from '../../domain/repositories/task-repository.ts';

export interface PostgresTaskRepositoryDependencies {
  pool: Pool;
}

export const makePostgresTaskRepository = ({
  pool,
}: PostgresTaskRepositoryDependencies): TaskRepository => ({
  findAll: async () => {
    const { rows } = await pool.query<Task>(
      'SELECT id, title, completed FROM tasks',
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await pool.query<Task>(
      'SELECT id, title, completed FROM tasks WHERE id = $1',
      [id],
    );
    return rows[0];
  },
  save: async ({ completed, id, title }) => {
    await pool.query(
      `INSERT INTO tasks (id, title, completed) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, completed = EXCLUDED.completed`,
      [id, title, completed],
    );
  },
});
