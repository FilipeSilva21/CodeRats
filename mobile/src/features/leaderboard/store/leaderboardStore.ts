import { create } from 'zustand';
import api from '../../../lib/api';

interface LeaderboardUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  totalScore: number;
}

interface LeaderboardState {
  users: LeaderboardUser[];
  isLoading: boolean;
  error: string | null;
  fetchGlobalLeaderboard: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  users: [],
  isLoading: false,
  error: null,
  fetchGlobalLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('[LeaderboardStore] Fetching global leaderboard...');
      const { data } = await api.get('/leaderboard/global');
      console.log('[LeaderboardStore] Leaderboard received:', data.length, 'users');
      set({ users: data, isLoading: false });
    } catch (e: any) {
      console.error('[LeaderboardStore] fetchGlobalLeaderboard FAILED:', e.response?.status, e.response?.data || e.message);
      set({ error: e.message || 'Failed to load leaderboard', isLoading: false });
    }
  },
}));
