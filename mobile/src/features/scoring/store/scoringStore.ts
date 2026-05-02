import { create } from 'zustand';
import api from '../../../lib/api';

interface ScoringState {
  totalScore: number;
  todayScore: number;
  currentStreak: number;
  bestStreak: number;
  streakBonus: number;
  dailyCap: number;
  capped: boolean;
  recentScores: any[];
  isLoading: boolean;
  fetchScoreSummary: () => Promise<void>;
  fetchDailyProgress: () => Promise<void>;
}

export const useScoringStore = create<ScoringState>((set) => ({
  totalScore: 0,
  todayScore: 0,
  currentStreak: 0,
  bestStreak: 0,
  streakBonus: 0,
  dailyCap: 200,
  capped: false,
  recentScores: [],
  isLoading: false,

  fetchScoreSummary: async () => {
    set({ isLoading: true });
    try {
      console.log('[ScoringStore] Fetching score summary...');
      const { data } = await api.get('/scores/me');
      console.log('[ScoringStore] Score summary received:', JSON.stringify(data));
      set({
        totalScore: data.totalScore,
        todayScore: data.todayScore,
        currentStreak: data.currentStreak,
        bestStreak: data.bestStreak,
        streakBonus: data.streakBonus,
        recentScores: data.recentScores,
        isLoading: false,
      });
    } catch (e: any) {
      console.error('[ScoringStore] fetchScoreSummary FAILED:', e.response?.status, e.response?.data || e.message);
      set({ isLoading: false });
    }
  },

  fetchDailyProgress: async () => {
    try {
      console.log('[ScoringStore] Fetching daily progress...');
      const { data } = await api.get('/scores/me/daily');
      console.log('[ScoringStore] Daily progress received:', JSON.stringify(data));
      set({ todayScore: data.totalPoints, capped: data.capped, dailyCap: data.dailyCap });
    } catch (e: any) {
      console.error('[ScoringStore] fetchDailyProgress FAILED:', e.response?.status, e.response?.data || e.message);
    }
  },
}));
