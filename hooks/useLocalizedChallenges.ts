import { useMemo } from 'react';

import { localizeChallenges } from '@/lib/challengesLocale';
import { useT } from '@/hooks/useT';
import { useChallengesStore } from '@/stores';

export function useLocalizedChallenges() {
  const { locale } = useT();
  const seeds = useChallengesStore((s) => s.challenges);
  return useMemo(
    () => localizeChallenges(seeds, locale),
    [seeds, locale]
  );
}
