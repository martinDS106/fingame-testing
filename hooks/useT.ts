import { useCallback, useMemo } from 'react';

import { translate, isRTL, type Locale } from '@/lib/i18n';
import { useLocaleStore } from '@/stores/useLocaleStore';

export function useT() {
  const locale = useLocaleStore((s) => s.locale);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  );

  const rtl = useMemo(() => isRTL(locale), [locale]);

  return { t, locale: locale as Locale, rtl };
}
