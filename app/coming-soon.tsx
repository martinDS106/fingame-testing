import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { HelpCircle } from 'lucide-react-native';

import { ComingSoon } from '@/components/ComingSoon';

export default function ComingSoonScreen() {
  const params = useLocalSearchParams<{ title?: string; description?: string }>();
  const title = useMemo(() => (params.title ?? 'Coming soon').toString(), [params.title]);
  const description = useMemo(
    () => (params.description ? params.description.toString() : undefined),
    [params.description]
  );

  return <ComingSoon title={title} description={description} Icon={HelpCircle} />;
}

