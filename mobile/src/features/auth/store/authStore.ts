import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../../../lib/api';

interface User { id: string; username: string; displayName: string; avatarUrl: string | null; totalScore: number; currentStreak: number; bestStreak: number; }
interface AuthState { user: User | null; isAuthenticated: boolean; isLoading: boolean; error: string | null; login: (code: string) => Promise<void>; logout: () => Promise<void>; loadSession: () => Promise<void>; fetchProfile: () => Promise<void>; }

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, isAuthenticated: false, isLoading: true, error: null,
  login: async (code) => {
    set({ isLoading: true, error: null });
    try { const { data } = await api.get(`/auth/github/callback?code=${code}`); await SecureStore.setItemAsync('accessToken', data.accessToken); await SecureStore.setItemAsync('refreshToken', data.refreshToken); set({ user: data.user, isAuthenticated: true, isLoading: false }); }
    catch (e: any) { set({ error: e.message || 'Login failed', isLoading: false }); }
  },
  logout: async () => { try { await api.delete('/auth/logout'); } catch {} await SecureStore.deleteItemAsync('accessToken'); await SecureStore.deleteItemAsync('refreshToken'); set({ user: null, isAuthenticated: false, isLoading: false }); },
  loadSession: async () => { try { const token = await SecureStore.getItemAsync('accessToken'); if (!token) { set({ isLoading: false }); return; } await get().fetchProfile(); } catch { set({ isLoading: false }); } },
  fetchProfile: async () => { try { const { data } = await api.get('/auth/me'); set({ user: data, isAuthenticated: true, isLoading: false }); } catch { set({ user: null, isAuthenticated: false, isLoading: false }); } },
}));
