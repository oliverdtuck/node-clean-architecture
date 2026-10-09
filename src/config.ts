import type { LevelWithSilent } from 'pino';

import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  PORT: z.coerce.number().int().min(0).max(65_535).default(3000),
});

export interface Config {
  databaseUrl: string;
  logLevel: LevelWithSilent;
  port: number;
}

export const loadConfig = (): Config => {
  const env = envSchema.parse(process.env);
  return {
    databaseUrl: env.DATABASE_URL,
    logLevel: env.LOG_LEVEL,
    port: env.PORT,
  };
};
