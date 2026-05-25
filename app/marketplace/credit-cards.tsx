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
  localeIconRowStyle,
  localeTextBesideIconStyle,
  rtlRootDirection,
  rtlRowMerge,
  rtlTextStyle,
  mergeScrollContentRtl,
} from '@/lib/rtlStyle';
import { translateMarketplaceFeature } from '@/lib/marketplaceI18n';
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
  const { t, rtl, locale } = useT();
  const ta = rtlTextStyle(rtl);

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
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('creditCards.title')}
        coins={coins}
        showBack
        gradient={['#a855f7', '#9333ea']}
      />

      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <Pressable
          onPress={() => setFiltersOpen(true)}
          style={rtlRowMerge(rtl, {
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: '#faf5ff',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#f3e8ff',
          })}
        >
          <Text className="text-sm text-gray-700 font-medium" style={ta}>
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
        style={rtlRootDirection(rtl)}
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 120, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        {selected.length > 0 && (
          <LinearGradient
            colors={[colors.primary[600], '#9333ea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12, padding: 16 }}
          >
            <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between' })}>
              <View>
                <Text className="text-white/80 text-xs" style={ta}>
                  {t('creditCards.selectedForComparison')}
                </Text>
                <Text className="text-white text-lg font-semibold" style={ta}>
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
              <View
                style={[
                  localeIconRowStyle(rtl),
                  { alignItems: 'center', marginBottom: 12, gap: 12 },
                ]}
              >
                {rtl ? (
                  <>
                    <Pressable
                      onPress={() => toggleCompare(card.id)}
                      hitSlop={8}
                      className={`w-6 h-6 rounded items-center justify-center border-2 shrink-0 ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={14} color={colors.white} />}
                    </Pressable>
                    <View style={localeTextBesideIconStyle(rtl)}>
                      <Text
                        className="text-sm text-gray-800 font-semibold"
                        numberOfLines={1}
                        style={[ta, { alignSelf: 'stretch' }]}
                      >
                        {card.name}
                      </Text>
                      <Text
                        className="text-xs text-gray-600"
                        style={[ta, { alignSelf: 'stretch' }]}
                      >
                        {card.bank}
                      </Text>
                    </View>
                    <View className="w-12 h-12 bg-purple-50 rounded-lg items-center justify-center shrink-0">
                      <Text className="text-2xl">{card.logo}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View className="w-12 h-12 bg-purple-50 rounded-lg items-center justify-center shrink-0">
                      <Text className="text-2xl">{card.logo}</Text>
                    </View>
                    <View style={localeTextBesideIconStyle(rtl)}>
                      <Text
                        className="text-sm text-gray-800 font-semibold"
                        numberOfLines={1}
                        style={ta}
                      >
                        {card.name}
                      </Text>
                      <Text className="text-xs text-gray-600" style={ta}>
                        {card.bank}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => toggleCompare(card.id)}
                      hitSlop={8}
                      className={`w-6 h-6 rounded items-center justify-center border-2 shrink-0 ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={14} color={colors.white} />}
                    </Pressable>
                  </>
                )}
              </View>

              <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 4, marginBottom: 12 })}>
                <Star size={14} color="#eab308" fill="#eab308" />
                <Text className="text-sm text-gray-700 font-medium" style={ta}>
                  {card.rating}
                </Text>
                <Text className="text-xs text-gray-500 ml-1" style={ta}>
                  {t('creditCards.reviews', { n: card.reviewsCount })}
                </Text>
              </View>

              <View style={rtlRowMerge(rtl, { gap: 8, marginBottom: 12 })}>
                <View className="flex-1 p-2 bg-blue-50 rounded-lg">
                  <Text className="text-xs text-gray-600" style={ta}>
                    {t('creditCards.apr')}
                  </Text>
                  <Text className="text-base text-blue-600 font-bold" style={ta}>
                    {card.apr}%
                  </Text>
                </View>
                <View className="flex-1 p-2 bg-purple-50 rounded-lg">
                  <Text className="text-xs text-gray-600" style={ta}>
                    {t('creditCards.annualFee')}
                  </Text>
                  <Text className="text-base text-purple-600 font-bold" style={ta}>
                    {card.annualFee === 0
                      ? t('creditCards.free')
                      : `EGP ${formatNumber(card.annualFee)}`}
                  </Text>
                </View>
                <View className="flex-1 p-2 bg-green-50 rounded-lg">
                  <Text className="text-xs text-gray-600" style={ta}>
                    {t('creditCards.cashback')}
                  </Text>
                  <Text className="text-base text-green-600 font-bold" style={ta}>
                    {card.cashback}%
                  </Text>
                </View>
              </View>

              <View style={rtlRowMerge(rtl, { flexWrap: 'wrap', gap: 4, marginBottom: 12 })}>
                {card.benefits.slice(0, 3).map((b) => (
                  <Badge key={b} variant="neutral">
                    {translateMarketplaceFeature(locale, b)}
                  </Badge>
                ))}
              </View>

              <View
                style={[
                  localeIconRowStyle(rtl),
                  { alignItems: 'center', justifyContent: 'space-between' },
                ]}
              >
                <Button
                  size="sm"
                  onPress={() =>
                    router.push(`/marketplace/product/${card.id}`)
                  }
                >
                  {t('creditCards.viewDetails')}
                </Button>
                <Badge variant={tier.variant}>{t(tier.label)}</Badge>
              </View>

              {card.minIncome > 0 && (
                <View
                  className="mt-3 pt-3 border-t border-gray-100"
                  style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}
                >
                  <AlertCircle size={12} color={colors.gray[500]} />
                  <Text className="text-xs text-gray-600" style={ta}>
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
          <Text className="text-gray-800 font-semibold mb-2" style={ta}>
            {t('creditCards.tipsTitle')}
          </Text>
          <View className="gap-1">
            <Text className="text-xs text-gray-700" style={ta}>
              {t('creditCards.tip1')}
            </Text>
            <Text className="text-xs text-gray-700" style={ta}>
              {t('creditCards.tip2')}
            </Text>
            <Text className="text-xs text-gray-700" style={ta}>
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
            style={rtlRootDirection(rtl)}
          >
            <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 })}>
              <Text className="text-xl text-gray-800 font-semibold" style={ta}>
                {t('creditCards.filterProducts')}
              </Text>
              <Pressable onPress={() => setFiltersOpen(false)} hitSlop={8}>
                <X size={22} color={colors.gray[500]} />
              </Pressable>
            </View>

            <Text className="text-sm text-gray-700 font-medium mb-2" style={ta}>
              {t('creditCards.monthlyIncome')}
            </Text>
            <View
              className="mb-6"
              style={rtlRowMerge(rtl, { gap: 8, flexWrap: 'wrap' })}
            >
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
                      style={ta}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={rtlRowMerge(rtl, { gap: 8 })}>
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
