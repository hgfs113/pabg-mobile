import { create } from 'zustand';
import type { CampaignBundle } from '../types/campaign';
import { loadCampaign } from '../lib/loader';

interface CampaignState {
  bundle: CampaignBundle | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
}

export const useCampaign = create<CampaignState>((set) => ({
  bundle: null,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const bundle = await loadCampaign();
      set({ bundle, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
}));
