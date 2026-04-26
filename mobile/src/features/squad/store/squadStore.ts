import { create } from 'zustand';
import api from '../../../lib/api';

interface Squad { id: string; name: string; inviteCode: string; memberCount: number; maxMembers: number; }
interface SquadMember { userId: string; username: string; displayName: string; avatarUrl: string | null; totalScore: number; currentStreak: number; }
interface SquadState { squads: Squad[]; currentSquad: Squad | null; members: SquadMember[]; isLoading: boolean; error: string | null; fetchMySquads: () => Promise<void>; fetchSquadDetails: (id: string) => Promise<void>; createSquad: (name: string) => Promise<Squad>; joinSquad: (code: string) => Promise<void>; updateMembers: (m: SquadMember[]) => void; }

export const useSquadStore = create<SquadState>((set) => ({
  squads: [], currentSquad: null, members: [], isLoading: false, error: null,
  fetchMySquads: async () => { set({ isLoading: true }); try { const { data } = await api.get('/squads/my'); set({ squads: data, isLoading: false }); } catch (e: any) { set({ error: e.message, isLoading: false }); } },
  fetchSquadDetails: async (id) => { set({ isLoading: true }); try { const { data } = await api.get(`/squads/${id}`); set({ currentSquad: data.squad, members: data.members, isLoading: false }); } catch (e: any) { set({ error: e.message, isLoading: false }); } },
  createSquad: async (name) => { const { data } = await api.post('/squads', { name }); set((s) => ({ squads: [...s.squads, data] })); return data; },
  joinSquad: async (code) => { const { data } = await api.post('/squads/join', { inviteCode: code }); set((s) => ({ squads: [...s.squads, data.squad], currentSquad: data.squad, members: data.members })); },
  updateMembers: (members) => set({ members }),
}));
