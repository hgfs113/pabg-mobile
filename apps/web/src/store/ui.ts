import { create } from 'zustand';
import { useChat } from './chat';

interface UIState {
  questLogOpen: boolean;
  partyPanelOpen: boolean;
  chatOpen: boolean;
  /** Topic ID to auto-open quest panel after navigating to its region */
  pendingQuestId: string | null;

  toggleQuestLog: () => void;
  closeQuestLog: () => void;
  togglePartyPanel: () => void;
  toggleChat: () => void;
  /** Called from Quest Log when player clicks a quest entry */
  focusQuest: (topicId: string) => void;
  clearPendingQuest: () => void;
}

export const useUI = create<UIState>((set) => ({
  questLogOpen: false,
  partyPanelOpen: true,
  chatOpen: false,
  pendingQuestId: null,

  toggleQuestLog: () => set((s) => ({ questLogOpen: !s.questLogOpen })),
  closeQuestLog: () => set({ questLogOpen: false }),
  togglePartyPanel: () => set((s) => ({ partyPanelOpen: !s.partyPanelOpen })),
  toggleChat: () =>
    set((s) => {
      if (!s.chatOpen) useChat.getState().markRead();
      return { chatOpen: !s.chatOpen };
    }),

  focusQuest: (topicId) =>
    set({ questLogOpen: false, pendingQuestId: topicId }),

  clearPendingQuest: () => set({ pendingQuestId: null }),
}));
