import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { asyncStorage } from '@/stores/storage';

interface SettingsState {
  notificationsEnabled: boolean;
  dailyReminderId: string | null;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailyReminderId: (id: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: false,
      dailyReminderId: null,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setDailyReminderId: (id) => set({ dailyReminderId: id }),
    }),
    {
      name: 'fin-game/settings',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        notificationsEnabled: state.notificationsEnabled,
        dailyReminderId: state.dailyReminderId,
      }),
    }
  )
);

