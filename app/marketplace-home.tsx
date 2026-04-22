import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Building2,
  CreditCard,
  DollarSign,
  Filter,
  Search,
  Shield,
  Smartphone,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { router } from 'expo-router';

import { BottomNav } from '@/components/BottomNav';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import {
  MARKETPLACE_CATEGORIES,
  useMarketplaceStore,
  useUserStore,
  type ProductCategory,
} from '@/stores';
import { useT } from '@/hooks/useT';

const CATEGORY_ICONS: Record<
  ProductCategory,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  'bank-accounts': Building2,
  'credit-cards': CreditCard,
  loans: DollarSign,
  investments: TrendingUp,
  insurance: Shield,
  'mobile-wallets': Smartphone,
  'fintech-apps': Wallet,
};

function handleCategoryPress(id: ProductCategory) {
  switch (id) {
    case 'credit-cards':
      router.push('/marketplace/credit-cards');
      break;
    case 'loans':
      router.push('/marketplace/loan-calculator');
      break;
    default:
      // Keep the Marketplace hub useful even when categories are placeholders.
      router.push('/marketplace/credit-cards');
  }
}

export default function MarketplaceHomeScreen() {
  const coins = useUserStore((s) => s.coins);
  const comparisons = useMarketplaceStore((s) => s.comparisonsMade);
  const applications = useMarketplaceStore((s) => s.applications);
  const [query, setQuery] = useState('');
  const { t, locale } = useT();

  const level = useMemo(() => {
    if (comparisons >= 10) return { labelKey: 'marketplace.levelAnalyst', n: 5 };
    if (comparisons >= 6) return { labelKey: 'marketplace.levelExplorer', n: 3 };
    if (comparisons >= 3) return { labelKey: 'marketplace.levelRookie', n: 2 };
    return { labelKey: 'marketplace.levelNewbie', n: 1 };
  }, [comparisons]);

  const levelPct = Math.min(100, (comparisons / 10) * 100);
  const remaining = Math.max(0, 10 - comparisons);
  const productPlural =
    locale === 'ar' ? (remaining === 1 ? '' : 'ات') : remaining === 1 ? '' : 's';

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title={t('marketplace.title')}
        coins={coins}
        showBack
        gradient={[colors.primary[600], colors.primary[700]]}
      />

      <View className="px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search size={16} color={colors.gray[400]} />
          <TextInput
            placeholder={t('marketplace.searchPlaceholder')}
            placeholderTextColor={colors.gray[400]}
            value={query}
            onChangeText={setQuery}
            className="flex-1 text-sm text-gray-800"
          />
          <Pressable hitSlop={8}>
            <Filter size={16} color={colors.gray[500]} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#a855f7', colors.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 12, padding: 16 }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-white/80 text-sm">
                {t('marketplace.levelTitle')}
              </Text>
              <Text className="text-white text-2xl font-bold">
                {t(level.labelKey)}
              </Text>
            </View>
            <Badge variant="accent">
              {t('marketplace.levelBadge', { n: level.n })}
            </Badge>
          </View>
          <View className="bg-white/20 rounded-full h-2 overflow-hidden">
            <View
              style={{
                width: `${levelPct}%`,
                height: '100%',
                backgroundColor: colors.accent[400],
              }}
            />
          </View>
          <Text className="text-white/80 text-xs mt-2">
            {remaining > 0
              ? t('marketplace.compareMore', {
                  n: remaining,
                  plural: productPlural,
                })
              : t('marketplace.maxLevel')}
          </Text>
        </LinearGradient>

        {applications.length > 0 && (
          <Card>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-800 font-semibold">
                {t('marketplace.myApplications')}
              </Text>
              <Text className="text-xs text-gray-500">
                {t('marketplace.activeCount', { n: applications.length })}
              </Text>
            </View>
            {applications.slice(0, 2).map((app) => (
              <Pressable
                key={app.id}
                onPress={() =>
                  router.push(`/marketplace/application-tracking?id=${app.id}`)
                }
                className="flex-row items-center gap-3 p-2 rounded-lg active:bg-gray-50"
              >
                <Text className="text-2xl">{app.bankLogo}</Text>
                <View className="flex-1">
                  <Text className="text-sm text-gray-800" numberOfLines={1}>
                    {app.productName}
                  </Text>
                  <Text className="text-xs text-gray-500 capitalize">
                    {app.status.replace('_', ' ')}
                  </Text>
                </View>
                <Badge
                  variant={app.status === 'approved' ? 'success' : 'default'}
                >
                  {app.status === 'approved'
                    ? t('marketplace.approved')
                    : t('marketplace.inProgress')}
                </Badge>
              </Pressable>
            ))}
          </Card>
        )}

        <View>
          <Text className="text-gray-800 font-semibold mb-3">
            {t('marketplace.recommended')}
          </Text>
          <Pressable
            onPress={() => router.push('/marketplace/product/cib-smart')}
          >
            <Card className="bg-green-50 border border-green-200">
              <View className="flex-row items-start gap-3">
                <View className="w-12 h-12 bg-white rounded-lg items-center justify-center">
                  <CreditCard size={24} color={colors.primary[600]} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-800 font-semibold mb-1">
                    CIB Smart Credit Card
                  </Text>
                  <Text className="text-xs text-gray-600 mb-2">
                    {t('marketplace.recoSubtitle')}
                  </Text>
                  <Button
                    size="sm"
                    onPress={() =>
                      router.push('/marketplace/product/cib-smart')
                    }
                  >
                    {t('marketplace.viewDetails')}
                  </Button>
                </View>
              </View>
            </Card>
          </Pressable>
        </View>

        <View>
          <Text className="text-gray-800 font-semibold mb-3">
            {t('marketplace.browseCategories')}
          </Text>
          <View className="gap-3">
            {MARKETPLACE_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => handleCategoryPress(cat.id)}
                  className="active:opacity-80"
                >
                  <Card>
                    <View className="flex-row items-center gap-4">
                      <LinearGradient
                        colors={cat.color}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={28} color={colors.white} />
                      </LinearGradient>

                      <View className="flex-1">
                        <Text className="text-gray-800 font-semibold mb-1">
                          {cat.title}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {cat.description}
                        </Text>
                      </View>

                      <View className="items-end gap-2">
                        <Badge variant="neutral">{`${cat.count}`}</Badge>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card className="bg-yellow-50 border border-yellow-200">
          <Text className="text-gray-800 font-semibold mb-3">
            {t('marketplace.earnCoinsTitle')}
          </Text>
          <View className="gap-2">
            {[
              { label: t('marketplace.earnCompare10'), amt: 50 },
              { label: t('marketplace.earnFirstApp'), amt: 100 },
              { label: t('marketplace.earnReview'), amt: 25 },
              { label: t('marketplace.earnReferral'), amt: 150 },
            ].map((item) => (
              <View key={item.label} className="flex-row justify-between">
                <Text className="text-sm text-gray-700">• {item.label}</Text>
                <Text className="text-sm text-yellow-700 font-semibold">
                  {t('marketplace.earnCoinsSuffix', { n: item.amt })}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
