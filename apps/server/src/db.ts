import { createClient, type Client, type InValue } from '@libsql/client';
import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH ?? resolve(__dirname, '../data/pbg.db');

let client: Client | null = null;
let initPromise: Promise<void> | null = null;

function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL ?? `file:${DB_PATH}`;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    client = createClient({ url, authToken: authToken || undefined });
  }
  return client;
}

async function initSchema() {
  if (!process.env.TURSO_DATABASE_URL) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
  }

  const c = getClient();
  await c.executeMultiple(`
    CREATE TABLE IF NOT EXISTS players (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      color         TEXT NOT NULL,
      avatar        TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      joined_at     INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS progress (
      player_id               TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
      completed_topics        TEXT NOT NULL DEFAULT '[]',
      accepted_topics         TEXT NOT NULL DEFAULT '[]',
      xp                      INTEGER NOT NULL DEFAULT 0,
      last_completed_topic_id TEXT,
      last_visited_region_id  TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      player_id  TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id         TEXT PRIMARY KEY,
      player_id  TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      text       TEXT NOT NULL,
      sent_at    INTEGER NOT NULL
    );
  `);
}

export async function ensureDb() {
  if (!initPromise) initPromise = initSchema();
  return initPromise;
}

export async function dbExecute(sql: string, args: InValue[] = []) {
  await ensureDb();
  return getClient().execute({ sql, args });
}

export async function dbAll<T>(sql: string, args: InValue[] = []): Promise<T[]> {
  const result = await dbExecute(sql, args);
  return result.rows as T[];
}

export async function dbGet<T>(sql: string, args: InValue[] = []): Promise<T | undefined> {
  const result = await dbExecute(sql, args);
  return result.rows[0] as T | undefined;
}

export async function dbRun(sql: string, args: InValue[] = []) {
  await dbExecute(sql, args);
}

export interface PlayerRow {
  id: string;
  name: string;
  color: string;
  avatar: string;
  password_hash: string;
  joined_at: number;
}

export interface ProgressRow {
  player_id: string;
  completed_topics: string;
  accepted_topics: string;
  xp: number;
  last_completed_topic_id: string | null;
  last_visited_region_id: string | null;
}

export function parseJsonArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function rowToProgress(row: ProgressRow) {
  return {
    completedTopics: parseJsonArray(row.completed_topics),
    acceptedTopics: parseJsonArray(row.accepted_topics),
    xp: Number(row.xp),
    lastCompletedTopicId: row.last_completed_topic_id,
    lastVisitedRegionId: row.last_visited_region_id,
  };
}
