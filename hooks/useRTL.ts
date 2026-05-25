import { useMemo } from 'react';

import { isRTL, type Locale } from '@/lib/i18n';
import { useLocaleStore } from '@/stores/useLocaleStore';

/** Layout RTL from persisted locale — do not rely on I18nManager alone (Expo Go can lag). */
export function useRTL(): boolean {
  const locale = useLocaleStore((s) => s.locale);
  return useMemo(() => isRTL(locale as Locale), [locale]);
}
