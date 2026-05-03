import { create } from 'zustand';
import api from '../../../lib/api';

interface ScoringState {
  totalScore: number;
  todayScore: number;
  dailyCap: number;
  currentStreak: number;
  bestStreak: number;
  streakBonus: number | null;
  recentScores: { points: number; scoredAt: string; commitHash: string | null }[];
  isLoading: boolean;
  fetchScoreSummary: () => Promise<void>;
  fetchDailyProgress: () => Promise<void>;
}

export const useScoringStore = create<ScoringState>((set, get) => ({
  totalScore: 0,
  todayScore: 0,
  dailyCap: 1000,
  currentStreak: 0,
  bestStreak: 0,
  streakBonus: null,
  recentScores: [],
  isLoading: false,

  fetchScoreSummary: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/scores/me');

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
      const { data } = await api.get('/scores/me/daily');

      set({ todayScore: data.totalPoints, capped: data.capped, dailyCap: data.dailyCap });
    } catch (e: any) {
      console.error('[ScoringStore] fetchDailyProgress FAILED:', e.response?.status, e.response?.data || e.message);
    }
  },
}));
