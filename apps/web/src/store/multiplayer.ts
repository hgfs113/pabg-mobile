/**
 * Online multiplayer — shared server DB, sync across all devices.
 */
import { create } from 'zustand';
import {
  apiLogin,
  apiMe,
  apiPatchProgress,
  apiRegister,
  fetchWorld,
  readAuthToken,
  writeAuthToken,
} from '../lib/api';

const SESSION_KEY = 'pbg-session-v1';

export const PLAYER_COLORS = [
  '#e8734a', '#6aaa8e', '#9b7fd4', '#e8b84a',
  '#5ba8d4', '#d45b8a', '#4abec8', '#a8d45b',
];

export const PLAYER_AVATARS = [
  '/content/assets/image_0.png',
  '/content/assets/image_1.png',
  '/content/assets/image_2.png',
  '/content/assets/image_3.png',
];

export interface PlayerMeta {
  id: string;
  name: string;
  color: string;
  avatar: string;
  joinedAt: number;
}

export interface PlayerProgress {
  completedTopics: string[];
  acceptedTopics: string[];
  xp: number;
  lastCompletedTopicId: string | null;
  lastVisitedRegionId: string | null;
}

const EMPTY_PROGRESS: PlayerProgress = {
  completedTopics: [],
  acceptedTopics: [],
  xp: 0,
  lastCompletedTopicId: null,
  lastVisitedRegionId: null,
};

type AuthResult = { ok: true } | { ok: false; error?: string };

interface MultiplayerState {
  players:         Record<string, PlayerMeta>;
  progress:        Record<string, PlayerProgress>;
  currentPlayerId: string | null;
  ready:           boolean;

  bootstrap:       () => Promise<void>;
  syncWorld:       () => Promise<void>;
  register:        (name: string, password: string) => Promise<AuthResult>;
  login:           (name: string, password: string) => Promise<AuthResult>;
  logout:          () => void;
  acceptTopic:     (topicId: string) => void;
  completeTopic:   (topicId: string, xp: number) => void;
  visitRegion:     (regionId: string) => void;
  resetProgress:   () => void;
}

function readSession(): string | null {
  try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; }
}

function writeSession(id: string | null) {
  try {
    if (id) sessionStorage.setItem(SESSION_KEY, id);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

function pushProgressOnline(get: () => MultiplayerState) {
  const { currentPlayerId, progress } = get();
  if (!currentPlayerId) return;
  const p = progress[currentPlayerId];
  if (!p) return;
  void apiPatchProgress(p).catch(() => {});
}

export const useMultiplayer = create<MultiplayerState>()((set, get) => ({
  players: {},
  progress: {},
  currentPlayerId: null,
  ready: false,

  async bootstrap() {
    const token = readAuthToken();
    if (!token) {
      set({ ready: true, currentPlayerId: null });
      return;
    }

    try {
      const [me, world] = await Promise.all([apiMe(), fetchWorld()]);
      set({
        currentPlayerId: me.player.id,
        players: world.players,
        progress: world.progress,
        ready: true,
      });
      writeSession(me.player.id);
    } catch {
      writeAuthToken(null);
      writeSession(null);
      set({ ready: true, currentPlayerId: null, players: {}, progress: {} });
    }
  },

  async syncWorld() {
    try {
      const world = await fetchWorld();
      set({ players: world.players, progress: world.progress });
    } catch {
      /* server unreachable — keep last known state */
    }
  },

  async register(name, password) {
    try {
      const { token, player } = await apiRegister(name, password);
      writeAuthToken(token);
      writeSession(player.id);
      const world = await fetchWorld();
      set({
        currentPlayerId: player.id,
        players: world.players,
        progress: world.progress,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Register failed.' };
    }
  },

  async login(name, password) {
    try {
      const { token, player } = await apiLogin(name, password);
      writeAuthToken(token);
      writeSession(player.id);
      const world = await fetchWorld();
      set({
        currentPlayerId: player.id,
        players: world.players,
        progress: world.progress,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Login failed.' };
    }
  },

  logout() {
    writeAuthToken(null);
    set({ currentPlayerId: null });
    writeSession(null);
  },

  acceptTopic(topicId) {
    const { currentPlayerId, progress } = get();
    if (!currentPlayerId) return;
    const p = progress[currentPlayerId] ?? EMPTY_PROGRESS;
    if (p.acceptedTopics.includes(topicId)) return;
    const next = {
      ...progress,
      [currentPlayerId]: { ...p, acceptedTopics: [...p.acceptedTopics, topicId] },
    };
    set({ progress: next });
    pushProgressOnline(get);
  },

  completeTopic(topicId, xpGain) {
    const { currentPlayerId, progress } = get();
    if (!currentPlayerId) return;
    const p = progress[currentPlayerId] ?? EMPTY_PROGRESS;
    if (p.completedTopics.includes(topicId)) return;
    const next = {
      ...progress,
      [currentPlayerId]: {
        ...p,
        completedTopics: [...p.completedTopics, topicId],
        acceptedTopics: p.acceptedTopics.includes(topicId)
          ? p.acceptedTopics
          : [...p.acceptedTopics, topicId],
        xp: p.xp + xpGain,
        lastCompletedTopicId: topicId,
      },
    };
    set({ progress: next });
    pushProgressOnline(get);
  },

  visitRegion(regionId) {
    const { currentPlayerId, progress } = get();
    if (!currentPlayerId) return;
    const p = progress[currentPlayerId] ?? EMPTY_PROGRESS;
    if (p.lastVisitedRegionId === regionId) return;
    const next = {
      ...progress,
      [currentPlayerId]: { ...p, lastVisitedRegionId: regionId },
    };
    set({ progress: next });
    pushProgressOnline(get);
  },

  resetProgress() {
    const { currentPlayerId, progress } = get();
    if (!currentPlayerId) return;
    const next = { ...progress, [currentPlayerId]: { ...EMPTY_PROGRESS } };
    set({ progress: next });
    pushProgressOnline(get);
  },
}));

export function currentProgress(state: MultiplayerState): PlayerProgress {
  const id = state.currentPlayerId;
  const p = id && state.progress[id] ? state.progress[id] : { ...EMPTY_PROGRESS };
  return { ...EMPTY_PROGRESS, ...p };
}
