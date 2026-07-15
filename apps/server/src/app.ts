import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ensureDb } from './db.js';
import {
  getProgress,
  getWorld,
  loginPlayer,
  registerPlayer,
  resolveSession,
  saveProgress,
} from './players.js';

export const app = new Hono();

const corsOrigin = process.env.CORS_ORIGIN ?? '*';
app.use('/*', cors({ origin: corsOrigin, allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'] }));

app.use('/*', async (_c, next) => {
  await ensureDb();
  await next();
});

app.get('/health', (c) => c.json({ ok: true }));

app.get('/api/world', async (c) => c.json(await getWorld()));

app.post('/api/auth/register', async (c) => {
  const body = await c.req.json<{ name?: string; password?: string }>();
  const result = await registerPlayer(body.name ?? '', body.password ?? '');
  if (!result.ok) return c.json(result, 400);
  return c.json({ token: result.token, player: result.player });
});

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json<{ name?: string; password?: string }>();
  const result = await loginPlayer(body.name ?? '', body.password ?? '');
  if (!result.ok) return c.json(result, 400);
  return c.json({ token: result.token, player: result.player });
});

app.get('/api/me', async (c) => {
  const playerId = await resolveSession(c.req.header('Authorization')?.replace(/^Bearer\s+/i, ''));
  if (!playerId) return c.json({ error: 'Unauthorized' }, 401);
  const world = await getWorld();
  return c.json({
    player: world.players[playerId],
    progress: world.progress[playerId] ?? (await getProgress(playerId)),
  });
});

app.patch('/api/me/progress', async (c) => {
  const playerId = await resolveSession(c.req.header('Authorization')?.replace(/^Bearer\s+/i, ''));
  if (!playerId) return c.json({ error: 'Unauthorized' }, 401);

  const patch = await c.req.json<Partial<{
    completedTopics: string[];
    acceptedTopics: string[];
    xp: number;
    lastCompletedTopicId: string | null;
    lastVisitedRegionId: string | null;
  }>>();

  const current = (await getProgress(playerId)) ?? {
    completedTopics: [],
    acceptedTopics: [],
    xp: 0,
    lastCompletedTopicId: null,
    lastVisitedRegionId: null,
  };

  const next = {
    completedTopics: patch.completedTopics ?? current.completedTopics,
    acceptedTopics: patch.acceptedTopics ?? current.acceptedTopics,
    xp: patch.xp ?? current.xp,
    lastCompletedTopicId:
      patch.lastCompletedTopicId !== undefined
        ? patch.lastCompletedTopicId
        : current.lastCompletedTopicId,
    lastVisitedRegionId:
      patch.lastVisitedRegionId !== undefined
        ? patch.lastVisitedRegionId
        : current.lastVisitedRegionId,
  };

  await saveProgress(playerId, next);
  return c.json({ progress: next });
});
