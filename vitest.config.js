// @ts-check

import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/**/*.contract.ts', 'src/main.ts'],
      include: ['src/**/*.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    projects: [
      {
        test: {
          exclude: [...configDefaults.exclude, '**/*.integration.test.ts'],
          name: 'unit',
        },
      },
      {
        test: {
          // Every test file shares one database, so they run one at a time
          fileParallelism: false,
          globalSetup: ['vitest.global-setup.ts'],
          include: ['**/*.integration.test.ts'],
          name: 'integration',
        },
      },
    ],
    unstubEnvs: true,
  },
});
