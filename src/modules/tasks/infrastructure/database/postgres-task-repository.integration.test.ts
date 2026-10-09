import { Pool } from 'pg';
import { afterAll, beforeEach, describe, inject } from 'vitest';

import { testTaskRepositoryContract } from '../../domain/repositories/task-repository.contract.ts';
import { makePostgresTaskRepository } from './postgres-task-repository.ts';

const pool = new Pool({ connectionString: inject('databaseUrl') });

beforeEach(async () => {
  await pool.query('TRUNCATE tasks');
});

afterAll(async () => {
  await pool.end();
});

describe('makePostgresTaskRepository', () => {
  testTaskRepositoryContract(() => makePostgresTaskRepository({ pool }));
});
