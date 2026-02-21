import { create } from 'zustand';
import { api, Chapter, LeaderboardRow, UserState } from '../lib/api';

type AppState = {
  chapters: Chapter[];
  state?: UserState;
  leaderboard: LeaderboardRow[];
  loading: boolean;
  error?: string;

  bootstrap: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  setName: (name: string) => Promise<void>;
  updateProgress: (verseKey: string, pageNumber: number) => Promise<void>;
  updateGoals: (targetDays: number) => Promise<void>;
  checkIn: () => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  chapters: [],
  leaderboard: [],
  loading: false,

  bootstrap: async () => {
    set({ loading: true, error: undefined });
    try {
      const [chaptersRes, stateRes] = await Promise.all([api.chapters(), api.getState()]);
      set({ chapters: chaptersRes.chapters, state: stateRes.state, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message || 'Gagal load data' });
    }
  },

  refreshLeaderboard: async () => {
    const res = await api.leaderboard(20);
    set({ leaderboard: res.leaderboard });
  },

  setName: async (name: string) => {
    const trimmed = name.trim();
    const res = await api.setProfile({ name: trimmed.length ? trimmed : null });
    set({ state: res.state });
  },

  updateProgress: async (verseKey, pageNumber) => {
    const res = await api.setProgress({ lastVerseKey: verseKey, lastPageNumber: pageNumber });
    set({ state: res.state });
  },

  updateGoals: async (targetDays) => {
    const current = get().state;
    const startDate = current?.startDate ?? new Date().toISOString();
    const res = await api.setGoals({ targetDays, startDate });
    set({ state: res.state });
  },

  checkIn: async () => {
    const res = await api.checkIn();
    set({ state: res.state });
  }
}));
