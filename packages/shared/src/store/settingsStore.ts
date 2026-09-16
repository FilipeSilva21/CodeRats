import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sharedStorage } from '../storage';

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
        getItem: async (name) => sharedStorage ? await sharedStorage.getItemAsync(name) : null,
        setItem: async (name, value) => { if (sharedStorage) await sharedStorage.setItemAsync(name, value); },
        removeItem: async (name) => { if (sharedStorage) await sharedStorage.deleteItemAsync(name); },
      })),
    }
  )
);
