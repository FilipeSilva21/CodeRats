import { create } from 'zustand';
import { sharedStorage } from '../storage';
import { sharedNotifications } from '../notifications';
import api from '../api';

export interface User { id: string; username: string; displayName: string; avatarUrl: string | null; totalScore: number; currentStreak: number; bestStreak: number; league?: string; }
export interface AuthState { user: User | null; isAuthenticated: boolean; isLoading: boolean; error: string | null; login: (code: string) => Promise<void>; logout: () => Promise<void>; deleteAccount: () => Promise<void>; loadSession: () => Promise<void>; fetchProfile: () => Promise<void>; }

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, isAuthenticated: false, isLoading: true, error: null,
  login: async (code) => {
    set({ isLoading: true, error: null });
    try { 
      const { data } = await api.get(`/auth/github/callback?code=${code}`); 
      if (sharedStorage) {
        await sharedStorage.setItemAsync('accessToken', data.accessToken); 
        await sharedStorage.setItemAsync('refreshToken', data.refreshToken); 
      }
      set({ user: data.user, isAuthenticated: true, isLoading: false }); 
    }
    catch (e: any) { set({ error: e.message || 'Login failed', isLoading: false }); }
  },
  logout: async () => { 
    try { if (sharedNotifications) await sharedNotifications.clearPushToken(); } catch {} 
    try { await api.delete('/auth/logout'); } catch {} 
    if (sharedStorage) {
      await sharedStorage.deleteItemAsync('accessToken'); 
      await sharedStorage.deleteItemAsync('refreshToken'); 
    }
    set({ user: null, isAuthenticated: false, isLoading: false }); 
  },
  deleteAccount: async () => {
    try {
      try { if (sharedNotifications) await sharedNotifications.clearPushToken(); } catch {}
      await api.delete('/auth/me');
      if (sharedStorage) {
        await sharedStorage.deleteItemAsync('accessToken');
        await sharedStorage.deleteItemAsync('refreshToken');
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (e: any) {
      throw new Error(e.response?.data?.error || 'Failed to delete account');
    }
  },
  loadSession: async () => { 
    try { 
      const token = sharedStorage ? await sharedStorage.getItemAsync('accessToken') : null; 
      if (!token) { set({ isLoading: false }); return; } 
      await get().fetchProfile(); 
    } catch { set({ isLoading: false }); } 
  },
  fetchProfile: async () => { 
    try { 
      const { data } = await api.get('/auth/me'); 
      set({ user: data, isAuthenticated: true, isLoading: false }); 
    } catch (e: any) { 
      if (e.response?.status !== 401) {
        console.error('Fetch profile failed:', e.response?.data || e.message);
      }
      set({ user: null, isAuthenticated: false, isLoading: false }); 
    } 
  },
}));
