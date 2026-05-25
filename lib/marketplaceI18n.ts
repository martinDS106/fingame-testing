import type { Locale } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import type { ProductCategory } from '@/stores/useMarketplaceStore';

const FEATURE_KEY_MAP: Record<string, string> = {
  'Reward points': 'marketplace.feature.rewardPoints',
  'Purchase protection': 'marketplace.feature.purchaseProtection',
  'Balance transfer': 'marketplace.feature.balanceTransfer',
  'Free ATM withdrawals': 'marketplace.feature.freeAtm',
};

export function marketplaceCategoryTitle(locale: Locale, id: ProductCategory): string {
  return translate(locale, `marketplace.category.${id}.title`);
}

export function marketplaceCategoryDesc(locale: Locale, id: ProductCategory): string {
  return translate(locale, `marketplace.category.${id}.desc`);
}

export function translateMarketplaceFeature(locale: Locale, label: string): string {
  const key = FEATURE_KEY_MAP[label];
  if (!key) return label;
  const t = translate(locale, key);
  return t === key ? label : t;
}
