import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import {
  dbAll,
  dbGet,
  dbRun,
  rowToProgress,
  type PlayerRow,
  type ProgressRow,
} from './db.js';

const PLAYER_COLORS = [
  '#e8734a', '#6aaa8e', '#9b7fd4', '#e8b84a',
  '#5ba8d4', '#d45b8a', '#4abec8', '#a8d45b',
];

const PLAYER_AVATARS = [
  '/content/assets/image_0.png',
  '/content/assets/image_1.png',
  '/content/assets/image_2.png',
  '/content/assets/image_3.png',
];

const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

export function publicPlayer(row: PlayerRow) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    avatar: row.avatar,
    joinedAt: row.joined_at,
  };
}

export async function getWorld() {
  const players = await dbAll<PlayerRow>('SELECT * FROM players ORDER BY joined_at ASC');
  const progressRows = await dbAll<ProgressRow>('SELECT * FROM progress');
  const progressById = Object.fromEntries(
    progressRows.map((row) => [row.player_id, rowToProgress(row)]),
  );

  return {
    players: Object.fromEntries(players.map((p) => [p.id, publicPlayer(p)])),
    progress: progressById,
  };
}

export async function registerPlayer(name: string, password: string) {
  const trimmed = name.trim();
  const id = trimmed.toLowerCase();
  if (!id) return { ok: false as const, error: 'Name cannot be empty.' };
  if (id.length > 24) return { ok: false as const, error: 'Name too long (max 24 chars).' };

  const exists = await dbGet<{ id: string }>('SELECT id FROM players WHERE id = ?', [id]);
  if (exists) return { ok: false as const, error: 'That name is already taken.' };

  const count = await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM players');
  const idx = count?.c ?? 0;
  const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
  const avatar = PLAYER_AVATARS[idx % PLAYER_AVATARS.length];
  const passwordHash = bcrypt.hashSync(password, 10);
  const joinedAt = Date.now();

  await dbRun(
    'INSERT INTO players (id, name, color, avatar, password_hash, joined_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, trimmed, color, avatar, passwordHash, joinedAt],
  );

  await dbRun(
    `INSERT INTO progress (player_id, completed_topics, accepted_topics, xp)
     VALUES (?, '[]', '[]', 0)`,
    [id],
  );

  const token = await createSession(id);
  const player = await dbGet<PlayerRow>('SELECT * FROM players WHERE id = ?', [id]);
  if (!player) return { ok: false as const, error: 'Register failed.' };
  return { ok: true as const, token, player: publicPlayer(player) };
}

export async function loginPlayer(name: string, password: string) {
  const id = name.trim().toLowerCase();
  const row = await dbGet<PlayerRow>('SELECT * FROM players WHERE id = ?', [id]);
  if (!row) return { ok: false as const, error: 'Player not found.' };
  if (!bcrypt.compareSync(password, row.password_hash)) {
    return { ok: false as const, error: 'Wrong password.' };
  }
  const token = await createSession(id);
  return { ok: true as const, token, player: publicPlayer(row) };
}

async function createSession(playerId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_MS;
  await dbRun('INSERT INTO sessions (token, player_id, expires_at) VALUES (?, ?, ?)', [
    token,
    playerId,
    expiresAt,
  ]);
  return token;
}

export async function resolveSession(token: string | undefined) {
  if (!token) return null;
  const row = await dbGet<{ player_id: string; expires_at: number }>(
    'SELECT player_id, expires_at FROM sessions WHERE token = ?',
    [token],
  );
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    await dbRun('DELETE FROM sessions WHERE token = ?', [token]);
    return null;
  }
  return row.player_id;
}

export async function getProgress(playerId: string) {
  const row = await dbGet<ProgressRow>('SELECT * FROM progress WHERE player_id = ?', [playerId]);
  return row ? rowToProgress(row) : null;
}

export async function saveProgress(
  playerId: string,
  progress: ReturnType<typeof rowToProgress>,
) {
  await dbRun(
    `UPDATE progress SET
      completed_topics = ?,
      accepted_topics = ?,
      xp = ?,
      last_completed_topic_id = ?,
      last_visited_region_id = ?
     WHERE player_id = ?`,
    [
      JSON.stringify(progress.completedTopics),
      JSON.stringify(progress.acceptedTopics),
      progress.xp,
      progress.lastCompletedTopicId,
      progress.lastVisitedRegionId,
      playerId,
    ],
  );
}
