import type { TestProject } from 'vitest/node';

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { runner } from 'node-pg-migrate';
import { join } from 'node:path';

declare module 'vitest' {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

/** Starts one migrated Postgres for the integration tests, and returns the teardown that removes it. */
const setup = async (project: TestProject): Promise<() => Promise<void>> => {
  const container = await new PostgreSqlContainer('postgres:18').start();
  const databaseUrl = container.getConnectionUri();

  await runner({
    databaseUrl,
    dir: join(import.meta.dirname, 'migrations'),
    direction: 'up',
    log: () => undefined,
    migrationsTable: 'pgmigrations',
  });

  project.provide('databaseUrl', databaseUrl);

  return async () => {
    await container.stop();
  };
};

export default setup;
