import { create } from 'zustand';
import api from '../../../lib/api';

export interface Squad { id: string; name: string; description: string | null; imageUrl: string | null; inviteCode: string; ownerId: string; memberCount: number; maxMembers: number; }
export interface SquadMember { userId: string; username: string; displayName: string; avatarUrl: string | null; totalScore: number; role: string; }
interface SquadState { squads: Squad[]; currentSquad: Squad | null; members: SquadMember[]; isLoading: boolean; error: string | null; fetchMySquads: () => Promise<void>; fetchSquadDetails: (id: string) => Promise<void>; createSquad: (name: string) => Promise<Squad>; joinSquad: (code: string) => Promise<void>; updateSquad: (id: string, name: string, desc: string, img: string) => Promise<void>; leaveSquad: (id: string) => Promise<void>; clearCurrentSquad: () => void; updateMembers: (m: SquadMember[]) => void; }

export const useSquadStore = create<SquadState>((set, get) => ({
  squads: [], currentSquad: null, members: [], isLoading: false, error: null,
  fetchMySquads: async () => { set({ isLoading: true }); try { const { data } = await api.get('/squads/my'); set({ squads: data, isLoading: false }); } catch (e: any) { set({ error: e.message, isLoading: false }); } },
  fetchSquadDetails: async (id) => { set({ isLoading: true }); try { const { data } = await api.get(`/squads/${id}`); set({ currentSquad: data.squad, members: data.members, isLoading: false }); } catch (e: any) { set({ error: e.message, isLoading: false }); } },
  createSquad: async (name) => { const { data } = await api.post('/squads', { name }); set((s) => ({ squads: [...s.squads, data] })); return data; },
  joinSquad: async (code) => { const { data } = await api.post('/squads/join', { inviteCode: code }); set((s) => ({ squads: [...s.squads, data.squad], currentSquad: data.squad, members: data.members })); },
  updateSquad: async (id, name, desc, img) => { const { data } = await api.patch(`/squads/${id}`, { name, description: desc || null, imageUrl: img || null }); set((s) => ({ currentSquad: data, squads: s.squads.map(sq => sq.id === id ? data : sq) })); },
  leaveSquad: async (id) => { await api.delete(`/squads/${id}/leave`); set((s) => ({ squads: s.squads.filter(sq => sq.id !== id), currentSquad: null, members: [] })); },
  clearCurrentSquad: () => set({ currentSquad: null, members: [] }),
  updateMembers: (members) => set({ members }),
}));
