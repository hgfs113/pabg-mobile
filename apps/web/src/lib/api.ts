import type { PlayerMeta, PlayerProgress } from '../store/multiplayer';

/** Same-origin API on Vercel; override with VITE_API_URL for custom backend. */
export function resolveApiBase(): string {
  const env = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
  if (env) return env;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/** Always online — progress lives on the server, not in localStorage. */
export const isOnlineMultiplayer = true;

const TOKEN_KEY = 'pbg-auth-token-v1';

export interface WorldSnapshot {
  players: Record<string, PlayerMeta>;
  progress: Record<string, PlayerProgress>;
}

export function readAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${resolveApiBase()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

function authHeaders(): Record<string, string> {
  const token = readAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchWorld(): Promise<WorldSnapshot> {
  return request<WorldSnapshot>('/api/world');
}

export async function apiMe() {
  return request<{ player: PlayerMeta; progress: PlayerProgress }>('/api/me', {
    headers: authHeaders(),
  });
}

export async function apiRegister(name: string, password: string) {
  return request<{ token: string; player: PlayerMeta }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, password }),
  });
}

export async function apiLogin(name: string, password: string) {
  return request<{ token: string; player: PlayerMeta }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ name, password }),
  });
}

export async function apiPatchProgress(progress: PlayerProgress) {
  return request<{ progress: PlayerProgress }>('/api/me/progress', {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(progress),
  });
}
