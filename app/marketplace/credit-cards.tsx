import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertCircle,
  Check,
  Filter,
  Star,
  X,
} from 'lucide-react-native';
import { router } from 'expo-router';

import { BottomNav } from '@/components/BottomNav';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';
import {
  useMarketplaceStore,
  useUserStore,
  type CardTier,
  type CreditCardProduct,
} from '@/stores';
import { useT } from '@/hooks/useT';

const TIER_STYLES: Record<
  CardTier,
  { label: string; variant: 'success' | 'warning' | 'danger' }
> = {
  strong: { label: 'creditCards.tierStrong', variant: 'success' },
  moderate: { label: 'creditCards.tierModerate', variant: 'warning' },
  high: { label: 'creditCards.tierHighCost', variant: 'danger' },
};

type IncomeFilter = 'all' | 'low' | 'mid' | 'high';

function filterProducts(
  products: CreditCardProduct[],
  income: IncomeFilter
): CreditCardProduct[] {
  if (income === 'all') return products;
  return products.filter((p) => {
    if (income === 'low') return p.minIncome < 5000;
    if (income === 'mid') return p.minIncome >= 5000 && p.minIncome < 10000;
    return p.minIncome >= 10000;
  });
}

export default function CreditCardsScreen() {
  const coins = useUserStore((s) => s.coins);
  const products = useMarketplaceStore((s) => s.products);
  const syncFromCloud = useMarketplaceStore((s) => s.syncFromCloud);
  const selected = useMarketplaceStore((s) => s.selectedForCompare);
  const toggleCompare = useMarketplaceStore((s) => s.toggleCompareSelection);
  const { t } = useT();

  useEffect(() => {
    void syncFromCloud();
  }, [syncFromCloud]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [incomeFilter, setIncomeFilter] = useState<IncomeFilter>('all');

  const visibleProducts = useMemo(
    () => filterProducts(products, incomeFilter),
    [products, incomeFilter]
  );

  const canCompare = selected.length >= 2;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title={t('creditCards.title')}
        coins={coins}
        showBack
        gradient={['#a855f7', '#9333ea']}
      />

      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <Pressable
          onPress={() => setFiltersOpen(true)}
          className="flex-row items-center justify-between px-3 py-2.5 bg-purple-50 rounded-lg border border-purple-100 active:opacity-70"
        >
          <Text className="text-sm text-gray-700 font-medium">
            {t('creditCards.smartFilters')}
            {incomeFilter !== 'all'
              ? ` · ${t('creditCards.income', { v: incomeFilter })}`
              : ''}
          </Text>
          <Filter size={16} color="#9333ea" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {selected.length > 0 && (
          <LinearGradient
            colors={[colors.primary[600], '#9333ea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12, padding: 16 }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white/80 text-xs">
                  {t('creditCards.selectedForComparison')}
                </Text>
                <Text className="text-white text-lg font-semibold">
                  {t('creditCards.selectedCount', { n: selected.length })}
                </Text>
              </View>
              <Button
                variant="accent"
                size="sm"
                disabled={!canCompare}
                onPress={() => router.push('/marketplace/compare')}
              >
                {t('creditCards.compareNow')}
              </Button>
            </View>
          </LinearGradient>
        )}

        {visibleProducts.map((card) => {
          const isSelected = selected.includes(card.id);
          const tier = TIER_STYLES[card.tier];
          return (
            <Card
              key={card.id}
              className={
                isSelected ? 'border-2 border-purple-500' : undefined
              }
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-12 h-12 bg-purple-50 rounded-lg items-center justify-center">
                    <Text className="text-2xl">{card.logo}</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm text-gray-800 font-semibold"
                      numberOfLines={1}
                    >
                      {card.name}
                    </Text>
                    <Text className="text-xs text-gray-600">{card.bank}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => toggleCompare(card.id)}
                  hitSlop={8}
                  className={`w-6 h-6 rounded items-center justify-center border-2 ${
                    isSelected
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && <Check size={14} color={colors.white} />}
                </Pressable>
              </View>

              <View className="flex-row items-center gap-1 mb-3">
                <Star size={14} color="#eab308" fill="#eab308" />
                <Text className="text-sm text-gray-700 font-medium">
                  {card.rating}
                </Text>
                <Text className="text-xs text-gray-500 ml-1">
                  {t('creditCards.reviews', { n: card.reviewsCount })}
                </Text>
              </View>

              <View className="flex-row gap-2 mb-3">
                <View className="flex-1 p-2 bg-blue-50 rounded-lg">
                  <Text className="text-xs text-gray-600">
                    {t('creditCards.apr')}
                  </Text>
                  <Text className="text-base text-blue-600 font-bold">
                    {card.apr}%
                  </Text>
                </View>
                <View className="flex-1 p-2 bg-purple-50 rounded-lg">
                  <Text className="text-xs text-gray-600">
                    {t('creditCards.annualFee')}
                  </Text>
                  <Text className="text-base text-purple-600 font-bold">
                    {card.annualFee === 0
                      ? t('creditCards.free')
                      : `EGP ${formatNumber(card.annualFee)}`}
                  </Text>
                </View>
                <View className="flex-1 p-2 bg-green-50 rounded-lg">
                  <Text className="text-xs text-gray-600">
                    {t('creditCards.cashback')}
                  </Text>
                  <Text className="text-base text-green-600 font-bold">
                    {card.cashback}%
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-1 mb-3">
                {card.benefits.slice(0, 3).map((b) => (
                  <Badge key={b} variant="neutral">
                    {b}
                  </Badge>
                ))}
              </View>

              <View className="flex-row items-center justify-between">
                <Badge variant={tier.variant}>{t(tier.label)}</Badge>
                <Button
                  size="sm"
                  onPress={() =>
                    router.push(`/marketplace/product/${card.id}`)
                  }
                >
                  {t('creditCards.viewDetails')}
                </Button>
              </View>

              {card.minIncome > 0 && (
                <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center gap-2">
                  <AlertCircle size={12} color={colors.gray[500]} />
                  <Text className="text-xs text-gray-600">
                    {t('creditCards.minIncome', {
                      n: formatNumber(card.minIncome),
                    })}
                  </Text>
                </View>
              )}
            </Card>
          );
        })}

        <Card className="bg-blue-50 border border-blue-200">
          <Text className="text-gray-800 font-semibold mb-2">
            {t('creditCards.tipsTitle')}
          </Text>
          <View className="gap-1">
            <Text className="text-xs text-gray-700">
              {t('creditCards.tip1')}
            </Text>
            <Text className="text-xs text-gray-700">
              {t('creditCards.tip2')}
            </Text>
            <Text className="text-xs text-gray-700">
              {t('creditCards.tip3')}
            </Text>
          </View>
        </Card>
      </ScrollView>

      <BottomNav />

      <Modal
        visible={filtersOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setFiltersOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl p-6"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl text-gray-800 font-semibold">
                {t('creditCards.filterProducts')}
              </Text>
              <Pressable onPress={() => setFiltersOpen(false)} hitSlop={8}>
                <X size={22} color={colors.gray[500]} />
              </Pressable>
            </View>

            <Text className="text-sm text-gray-700 font-medium mb-2">
              {t('creditCards.monthlyIncome')}
            </Text>
            <View className="flex-row gap-2 flex-wrap mb-6">
              {(
                [
                  { id: 'all', label: t('rewards.all') },
                  { id: 'low', label: '< 5K' },
                  { id: 'mid', label: '5K - 10K' },
                  { id: 'high', label: '10K+' },
                ] as { id: IncomeFilter; label: string }[]
              ).map((opt) => {
                const active = incomeFilter === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setIncomeFilter(opt.id)}
                    className={`px-4 py-2 rounded-lg border ${
                      active
                        ? 'bg-purple-600 border-purple-600'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  variant="outline"
                  fullWidth
                  onPress={() => {
                    setIncomeFilter('all');
                    setFiltersOpen(false);
                  }}
                >
                  {t('creditCards.reset')}
                </Button>
              </View>
              <View className="flex-1">
                <Button fullWidth onPress={() => setFiltersOpen(false)}>
                  {t('creditCards.applyFilters')}
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
