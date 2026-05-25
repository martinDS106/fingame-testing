import { Gift } from 'lucide-react-native';

import { ComingSoon } from '@/components/ComingSoon';
import { useT } from '@/hooks/useT';

/** Rewards tab: legacy redeem UI removed — full flow coming later. */
export default function MarketplaceRewardsScreen() {
  const { t } = useT();
  return (
    <ComingSoon
      title={t('rewards.title')}
      Icon={Gift}
    />
  );
}
