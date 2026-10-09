import { describe } from 'vitest';

import { testTaskRepositoryContract } from '../../domain/repositories/task-repository.contract.ts';
import { makeInMemoryTaskRepository } from './in-memory-task-repository.ts';

describe('makeInMemoryTaskRepository', () => {
  testTaskRepositoryContract(makeInMemoryTaskRepository);
});
