import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../../../lib/storage';

interface SettingsState {
  commitPrivacy: boolean;
  setCommitPrivacy: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      commitPrivacy: false,
      setCommitPrivacy: (val) => set({ commitPrivacy: val }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => ({
        getItem: storage.getItemAsync,
        setItem: storage.setItemAsync,
        removeItem: storage.deleteItemAsync,
      })),
    }
  )
);
