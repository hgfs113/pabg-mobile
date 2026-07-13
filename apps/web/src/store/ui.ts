import { create } from 'zustand';

interface UIState {
  questLogOpen: boolean;
  partyPanelOpen: boolean;
  /** Topic ID to auto-open quest panel after navigating to its region */
  pendingQuestId: string | null;

  toggleQuestLog: () => void;
  closeQuestLog: () => void;
  togglePartyPanel: () => void;
  /** Called from Quest Log when player clicks a quest entry */
  focusQuest: (topicId: string) => void;
  clearPendingQuest: () => void;
}

export const useUI = create<UIState>((set) => ({
  questLogOpen: false,
  partyPanelOpen: true,
  pendingQuestId: null,

  toggleQuestLog: () => set((s) => ({ questLogOpen: !s.questLogOpen })),
  closeQuestLog: () => set({ questLogOpen: false }),
  togglePartyPanel: () => set((s) => ({ partyPanelOpen: !s.partyPanelOpen })),

  focusQuest: (topicId) =>
    set({ questLogOpen: false, pendingQuestId: topicId }),

  clearPendingQuest: () => set({ pendingQuestId: null }),
}));
