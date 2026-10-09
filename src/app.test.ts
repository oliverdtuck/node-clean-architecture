import { Router } from 'express';
import { pino } from 'pino';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { makeApp } from './app.ts';

const logLine = z.object({
  err: z.object({ message: z.string() }).optional(),
  msg: z.string(),
});

/** An app with a test router, writing its logs to an array. */
const setup = () => {
  const logs: z.infer<typeof logLine>[] = [];
  const logger = pino(
    {},
    {
      write: (line: string) => {
        logs.push(logLine.parse(JSON.parse(line)));
      },
    },
  );

  const router = Router()
    .get('/', (_req, res) => {
      res.json({ reached: true });
    })
    // Async, like every real handler: Express 5 forwards the rejection to the error handler
    .post('/', async () => {
      await Promise.resolve();
      throw new Error('Database password is hunter2');
    });

  return { app: makeApp({ logger, routers: { '/things': router } }), logs };
};

describe('makeApp', () => {
  it('reports health', async () => {
    await request(setup().app).get('/health').expect(200, { status: 'ok' });
  });

  it('mounts each router at its path', async () => {
    await request(setup().app).get('/things').expect(200, { reached: true });
  });

  it('returns 404 for an unknown route', async () => {
    await request(setup().app)
      .get('/unknown')
      .expect(404, { error: 'Not found' });
  });

  it('returns 400 for a malformed JSON body without logging an unhandled error', async () => {
    const { app, logs } = setup();

    const response = await request(app)
      .post('/things')
      .set('content-type', 'application/json')
      .send('{oops')
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(logs.map((log) => log.msg)).not.toContain('Unhandled error');
  });

  it('hides unexpected errors behind a 500 and logs them', async () => {
    const { app, logs } = setup();

    await request(app)
      .post('/things')
      .expect(500, { error: 'Internal server error' });

    const log = logs.find(({ msg }) => msg === 'Unhandled error');
    expect(log?.err?.message).toBe('Database password is hunter2');
  });
});
