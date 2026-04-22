import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { asyncStorage } from './storage';
import { isRTL, type Locale } from '@/lib/i18n';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  rtl: () => boolean;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      rtl: () => isRTL(get().locale),
    }),
    {
      name: 'fin-game/locale',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
);
