/**
 * Multiplayer store.
 *
 * Shared data (players registry + all progress) is persisted to localStorage
 * under 'pbg-players-v1' so every tab in the same browser sees the same data.
 * Cross-tab sync is achieved via the Window 'storage' event.
 *
 * The current session (who is logged in in THIS tab) is stored in
 * sessionStorage so different tabs can be logged in as different players.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORE_KEY   = 'pbg-players-v1';
const SESSION_KEY = 'pbg-session-v1';
const PURGE_PLAYERS_KEY = 'pbg-purged-altuska-stray-v1';

export const PLAYER_COLORS = [
  '#e8734a', // terracotta
  '#6aaa8e', // sage
  '#9b7fd4', // lavender
  '#e8b84a', // amber
  '#5ba8d4', // sky
  '#d45b8a', // rose
  '#4abec8', // teal
  '#a8d45b', // lime
];

export const PLAYER_AVATARS = [
  '/content/assets/image_0.png',  // blue-cloak warrior
  '/content/assets/image_1.png', // dark mage
  '/content/assets/image_2.png', // knight scholar
  '/content/assets/image_3.png', // ranger scout
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlayerMeta {
  id: string;
  name: string;
  color: string;
  avatar: string;   // path to portrait image
  password: string; // plaintext — local-only, no real security needed
  joinedAt: number;
}

export interface PlayerProgress {
  completedTopics: string[];
  acceptedTopics: string[];
  xp: number;
  lastCompletedTopicId: string | null;
  /** World-map region the player last entered (marker stays on its node). */
  lastVisitedRegionId: string | null;
}

const EMPTY_PROGRESS: PlayerProgress = {
  completedTopics: [],
  acceptedTopics: [],
  xp: 0,
  lastCompletedTopicId: null,
  lastVisitedRegionId: null,
};

interface MultiplayerState {
  players:         Record<string, PlayerMeta>;
  progress:        Record<string, PlayerProgress>;
  currentPlayerId: string | null;

  register:     (name: string, password: string) => { ok: boolean; error?: string };
  login:        (name: string, password: string) => { ok: boolean; error?: string };
  logout:       () => void;
  removePlayer: (name: string) => void;
  acceptTopic:  (topicId: string) => void;
  completeTopic:(topicId: string, xp: number) => void;
  visitRegion:  (regionId: string) => void;
  resetProgress:() => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readSession(): string | null {
  try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; }
}
function writeSession(id: string | null) {
  try {
    if (id) sessionStorage.setItem(SESSION_KEY, id);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMultiplayer = create<MultiplayerState>()(
  persist(
    (set, get) => ({
      players: {},
      progress: {},
      currentPlayerId: readSession(),

      register(name, password) {
        const trimmed = name.trim();
        const id      = trimmed.toLowerCase();
        if (!id)               return { ok: false, error: 'Name cannot be empty.' };
        if (id.length > 24)    return { ok: false, error: 'Name too long (max 24 chars).' };

        const { players, progress } = get();
        if (players[id])       return { ok: false, error: 'That name is already taken.' };

        const idx   = Object.keys(players).length;
        const color  = PLAYER_COLORS[idx % PLAYER_COLORS.length];
        const avatar = PLAYER_AVATARS[idx % PLAYER_AVATARS.length];
        const newMeta: PlayerMeta = { id, name: trimmed, color, avatar, password, joinedAt: Date.now() };

        set({
          players:         { ...players,  [id]: newMeta },
          progress:        { ...progress, [id]: { ...EMPTY_PROGRESS } },
          currentPlayerId: id,
        });
        writeSession(id);
        return { ok: true };
      },

      login(name, password) {
        const id     = name.trim().toLowerCase();
        const player = get().players[id];
        if (!player)                  return { ok: false, error: 'Player not found.' };
        if (player.password !== password) return { ok: false, error: 'Wrong password.' };

        set({ currentPlayerId: id });
        writeSession(id);
        return { ok: true };
      },

      logout() {
        set({ currentPlayerId: null });
        writeSession(null);
      },

      removePlayer(name) {
        const id = name.trim().toLowerCase();
        if (!id) return;

        const { players, progress, currentPlayerId } = get();
        if (!players[id]) return;

        const nextPlayers = { ...players };
        const nextProgress = { ...progress };
        delete nextPlayers[id];
        delete nextProgress[id];

        set({
          players: nextPlayers,
          progress: nextProgress,
          currentPlayerId: currentPlayerId === id ? null : currentPlayerId,
        });
        if (currentPlayerId === id) writeSession(null);
      },

      acceptTopic(topicId) {
        const { currentPlayerId, progress } = get();
        if (!currentPlayerId) return;
        const p = progress[currentPlayerId] ?? EMPTY_PROGRESS;
        if (p.acceptedTopics.includes(topicId)) return;
        set({
          progress: {
            ...progress,
            [currentPlayerId]: { ...p, acceptedTopics: [...p.acceptedTopics, topicId] },
          },
        });
      },

      completeTopic(topicId, xpGain) {
        const { currentPlayerId, progress } = get();
        if (!currentPlayerId) return;
        const p = progress[currentPlayerId] ?? EMPTY_PROGRESS;
        if (p.completedTopics.includes(topicId)) return;
        set({
          progress: {
            ...progress,
            [currentPlayerId]: {
              ...p,
              completedTopics: [...p.completedTopics, topicId],
              acceptedTopics: p.acceptedTopics.includes(topicId)
                ? p.acceptedTopics
                : [...p.acceptedTopics, topicId],
              xp:                    p.xp + xpGain,
              lastCompletedTopicId:  topicId,
            },
          },
        });
      },

      visitRegion(regionId) {
        const { currentPlayerId, progress } = get();
        if (!currentPlayerId) return;
        const p = progress[currentPlayerId] ?? EMPTY_PROGRESS;
        if (p.lastVisitedRegionId === regionId) return;
        set({
          progress: {
            ...progress,
            [currentPlayerId]: { ...p, lastVisitedRegionId: regionId },
          },
        });
      },

      resetProgress() {
        const { currentPlayerId, progress } = get();
        if (!currentPlayerId) return;
        set({ progress: { ...progress, [currentPlayerId]: { ...EMPTY_PROGRESS } } });
      },
    }),

    {
      name: STORE_KEY,
      // Only persist shared data; currentPlayerId is managed via sessionStorage
      partialize: (s) => ({ players: s.players, progress: s.progress }),
    },
  ),
);

// ─── Cross-tab sync ───────────────────────────────────────────────────────────
// The 'storage' event fires in OTHER tabs when localStorage changes.
if (typeof window !== 'undefined') {
  useMultiplayer.persist.onFinishHydration(() => {
    try {
      if (localStorage.getItem(PURGE_PLAYERS_KEY)) return;
      const { removePlayer } = useMultiplayer.getState();
      removePlayer('altuska');
      removePlayer('stray');
      localStorage.setItem(PURGE_PLAYERS_KEY, '1');
    } catch {}
  });

  window.addEventListener('storage', (e) => {
    if (e.key !== STORE_KEY || !e.newValue) return;
    try {
      const { state } = JSON.parse(e.newValue);
      useMultiplayer.setState({
        players:  state.players  ?? {},
        progress: state.progress ?? {},
      });
    } catch {}
  });
}

// ─── Convenience selectors ────────────────────────────────────────────────────

export function currentProgress(state: MultiplayerState): PlayerProgress {
  const id = state.currentPlayerId;
  const p = (id && state.progress[id]) ? state.progress[id] : { ...EMPTY_PROGRESS };
  // Migrate older saves that lack lastVisitedRegionId
  return { ...EMPTY_PROGRESS, ...p };
}
