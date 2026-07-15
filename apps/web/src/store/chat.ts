import { create } from 'zustand';
import { fetchChat, postChat, type ChatMessage } from '../lib/api';

interface ChatState {
  messages: ChatMessage[];
  sending: boolean;

  sync: () => Promise<void>;
  send: (text: string) => Promise<boolean>;
}

function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]) {
  if (incoming.length === 0) return existing;
  const byId = new Map(existing.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.sentAt - b.sentAt);
}

export const useChat = create<ChatState>((set, get) => ({
  messages: [],
  sending: false,

  async sync() {
    try {
      const { messages } = get();
      const since = messages.length > 0 ? messages[messages.length - 1].sentAt : 0;
      const { messages: incoming } = await fetchChat(since);
      if (incoming.length === 0) return;
      set({ messages: mergeMessages(messages, incoming) });
    } catch {
      /* keep last known messages */
    }
  },

  async send(text) {
    const trimmed = text.trim();
    if (!trimmed || get().sending) return false;

    set({ sending: true });
    try {
      const { message } = await postChat(trimmed);
      set((s) => ({
        messages: mergeMessages(s.messages, [message]),
        sending: false,
      }));
      return true;
    } catch {
      set({ sending: false });
      return false;
    }
  },
}));
