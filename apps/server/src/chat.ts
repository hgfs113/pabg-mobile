import { randomBytes } from 'crypto';
import { dbAll, dbGet, dbRun } from './db.js';

const MAX_LEN = 400;
const MAX_MESSAGES = 200;

export interface ChatRow {
  id: string;
  player_id: string;
  text: string;
  sent_at: number;
  player_name?: string;
  player_color?: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  text: string;
  sentAt: number;
}

function rowToMessage(row: ChatRow): ChatMessage {
  return {
    id: row.id,
    playerId: row.player_id,
    playerName: row.player_name ?? row.player_id,
    playerColor: row.player_color ?? '#9b7fd4',
    text: row.text,
    sentAt: row.sent_at,
  };
}

export async function getChatMessages(since = 0) {
  const rows = await dbAll<ChatRow>(
    `SELECT m.id, m.player_id, m.text, m.sent_at, p.name as player_name, p.color as player_color
     FROM chat_messages m
     JOIN players p ON p.id = m.player_id
     WHERE m.sent_at > ?
     ORDER BY m.sent_at ASC
     LIMIT ?`,
    [since, MAX_MESSAGES],
  );
  return rows.map(rowToMessage);
}

export async function postChatMessage(playerId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false as const, error: 'Message cannot be empty.' };
  if (trimmed.length > MAX_LEN) {
    return { ok: false as const, error: `Message too long (max ${MAX_LEN} chars).` };
  }

  const player = await dbGet<{ id: string }>('SELECT id FROM players WHERE id = ?', [playerId]);
  if (!player) return { ok: false as const, error: 'Player not found.' };

  const id = randomBytes(12).toString('hex');
  const sentAt = Date.now();
  await dbRun('INSERT INTO chat_messages (id, player_id, text, sent_at) VALUES (?, ?, ?, ?)', [
    id,
    playerId,
    trimmed,
    sentAt,
  ]);

  const rows = await dbAll<ChatRow>(
    `SELECT m.id, m.player_id, m.text, m.sent_at, p.name as player_name, p.color as player_color
     FROM chat_messages m
     JOIN players p ON p.id = m.player_id
     WHERE m.id = ?`,
    [id],
  );

  return { ok: true as const, message: rowToMessage(rows[0]) };
}
