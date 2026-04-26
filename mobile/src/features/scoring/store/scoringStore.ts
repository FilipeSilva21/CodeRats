import { create } from 'zustand';
import api from '../../../lib/api';

interface ScoringState { totalScore: number; todayScore: number; currentStreak: number; bestStreak: number; streakBonus: number; dailyCap: number; capped: boolean; recentScores: any[]; isLoading: boolean; fetchScoreSummary: () => Promise<void>; fetchDailyProgress: () => Promise<void>; }

export const useScoringStore = create<ScoringState>((set) => ({
  totalScore: 0, todayScore: 0, currentStreak: 0, bestStreak: 0, streakBonus: 0, dailyCap: 200, capped: false, recentScores: [], isLoading: false,
  fetchScoreSummary: async () => { set({ isLoading: true }); try { const { data } = await api.get('/scores/me'); set({ totalScore: data.totalScore, todayScore: data.todayScore, currentStreak: data.currentStreak, bestStreak: data.bestStreak, streakBonus: data.streakBonus, recentScores: data.recentScores, isLoading: false }); } catch { set({ isLoading: false }); } },
  fetchDailyProgress: async () => { try { const { data } = await api.get('/scores/me/daily'); set({ todayScore: data.totalPoints, capped: data.capped, dailyCap: data.dailyCap }); } catch {} },
}));
