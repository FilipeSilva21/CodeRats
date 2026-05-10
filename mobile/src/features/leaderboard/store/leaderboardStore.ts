import { create } from 'zustand';
import api from '../../../lib/api';

interface LeaderboardUser {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  totalScore: number;
}

interface LeagueTier {
  name: string;
  color: string;
}

interface LeaderboardState {
  users: LeaderboardUser[];
  tiers: LeagueTier[];
  isLoading: boolean;
  error: string | null;
  fetchGlobalLeaderboard: () => Promise<void>;
  fetchTiers: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  users: [],
  tiers: [],
  isLoading: false,
  error: null,
  fetchGlobalLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/leaderboard/global');
      set({ users: data, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to load leaderboard', isLoading: false });
    }
  },
  fetchTiers: async () => {
    try {
      const { data } = await api.get('/leaderboard/tiers');
      set({ tiers: data });
    } catch (e: any) {
      console.error('Failed to fetch tiers', e);
    }
  }
}));
