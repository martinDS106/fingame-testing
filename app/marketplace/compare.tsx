import { useEffect, useMemo, useRef } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Award, CheckCircle2, XCircle } from 'lucide-react-native';
import { router } from 'expo-router';

import { BottomNav } from '@/components/BottomNav';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';
import {
  rtlRootDirection,
  rtlRow,
  rtlRowMerge,
  rtlTextStyle,
  mergeScrollContentRtl,
} from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { useMarketplaceStore, useUserStore } from '@/stores';

interface FeatureRow {
  label: string;
  key: 'apr' | 'annualFee' | 'minIncome' | 'cashback' | 'lounge' | 'insurance';
  type: 'number' | 'boolean';
  prefix?: string;
  suffix?: string;
}

const FEATURES: FeatureRow[] = [
  { label: 'APR', key: 'apr', type: 'number', suffix: '%' },
  { label: 'Annual Fee', key: 'annualFee', type: 'number', prefix: 'EGP ' },
  { label: 'Min Income', key: 'minIncome', type: 'number', prefix: 'EGP ' },
  { label: 'Cashback', key: 'cashback', type: 'number', suffix: '%' },
  { label: 'Lounge', key: 'lounge', type: 'boolean' },
  { label: 'Insurance', key: 'insurance', type: 'boolean' },
];

export default function CompareScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const coins = useUserStore((s) => s.coins);
  const addCoins = useUserStore((s) => s.addCoins);
  const products = useMarketplaceStore((s) => s.products);
  const selectedIds = useMarketplaceStore((s) => s.selectedForCompare);
  const trackComparison = useMarketplaceStore((s) => s.trackComparison);
  const clearSelection = useMarketplaceStore((s) => s.clearCompareSelection);

  const cards = useMemo(
    () =>
      selectedIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => !!p),
    [selectedIds, products]
  );

  const rewardedRef = useRef(false);
  useEffect(() => {
    if (cards.length < 2 || rewardedRef.current) return;
    void (async () => {
      const ok = await addCoins(10, 'manual');
      if (!ok) {
        Alert.alert(
          'Could not save reward',
          'Comparison reward did not sync. Please sign in again and retry.',
        );
        return;
      }
      trackComparison();
      rewardedRef.current = true;
    })();
  }, [cards.length, trackComparison, addCoins]);

  function getFeatureValue(
    card: (typeof cards)[number],
    key: FeatureRow['key']
  ): number | boolean {
    switch (key) {
      case 'apr':
        return card.apr;
      case 'annualFee':
        return card.annualFee;
      case 'minIncome':
        return card.minIncome;
      case 'cashback':
        return card.cashback;
      case 'lounge':
        return card.benefits.some((b) => b.toLowerCase().includes('lounge'));
      case 'insurance':
        return card.benefits.some((b) =>
          b.toLowerCase().includes('insurance')
        );
    }
  }

  const horizontalChipRow = mergeScrollContentRtl(rtl, { gap: 12, ...rtlRow(rtl) });

  if (cards.length < 2) {
    return (
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader
          title="Compare Products"
          coins={coins}
          showBack
          gradient={['#a855f7', '#9333ea']}
        />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-5xl mb-4">🔀</Text>
          <Text className="text-lg text-gray-800 font-semibold mb-2" style={ta}>
            Select at least 2 cards
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6" style={ta}>
            Head back to the listing and tick 2 or more cards to start comparing
            side-by-side.
          </Text>
          <Button onPress={() => router.replace('/marketplace/credit-cards')}>
            Browse Credit Cards
          </Button>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title="Compare Products"
        coins={coins}
        showBack
        gradient={['#a855f7', '#9333ea']}
      />

      <ScrollView
        className="flex-1"
        style={rtlRootDirection(rtl)}
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        <Card className="bg-yellow-50 border border-yellow-200">
          <Text className="text-sm text-gray-700" style={ta}>
            🎉 You earned{' '}
            <Text className="font-bold text-yellow-700">+10 coins</Text> for
            comparing products!
          </Text>
        </Card>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={rtlRootDirection(rtl)}
          contentContainerStyle={horizontalChipRow}
        >
          {cards.map((card) => (
            <View
              key={card.id}
              style={{ width: 180 }}
              className="bg-white rounded-xl p-3 border border-gray-100"
            >
              {card.isBestValue && (
                <Badge variant="success" leftIcon={<Award size={10} color="#15803d" />}>
                  Best Value
                </Badge>
              )}
              <View className="items-center mt-2 mb-2">
                <Text className="text-4xl mb-2">{card.logo}</Text>
                <Text
                  className="text-sm text-gray-800 font-semibold text-center"
                  numberOfLines={2}
                  style={ta}
                >
                  {card.name}
                </Text>
                <Text className="text-xs text-gray-500" style={ta}>
                  {card.bank}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="gap-2">
          {FEATURES.map((feature) => (
            <View key={feature.key} style={rtlRowMerge(rtl, { gap: 8 })}>
              <View style={{ width: 110 }} className="justify-center">
                <Text className="text-sm text-gray-700 font-medium" style={ta}>
                  {feature.label}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={rtlRootDirection(rtl)}
                contentContainerStyle={horizontalChipRow}
              >
                {cards.map((card) => {
                  const value = getFeatureValue(card, feature.key);
                  return (
                    <View
                      key={card.id}
                      style={{ width: 180 }}
                      className="bg-white rounded-lg p-3 border border-gray-100 items-center justify-center"
                    >
                      {feature.type === 'boolean' ? (
                        value ? (
                          <CheckCircle2 size={22} color="#22c55e" />
                        ) : (
                          <XCircle size={22} color={colors.gray[300]} />
                        )
                      ) : (
                        <Text className="text-sm text-gray-800 font-semibold" style={ta}>
                          {feature.prefix ?? ''}
                          {typeof value === 'number'
                            ? formatNumber(value)
                            : ''}
                          {feature.suffix ?? ''}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ))}
        </View>

        <View style={rtlRowMerge(rtl, { gap: 8, marginTop: 8 })}>
          <View style={{ width: 110 }} className="justify-center">
            <Text className="text-sm text-gray-700 font-medium" style={ta}>
              Best For
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={rtlRootDirection(rtl)}
            contentContainerStyle={horizontalChipRow}
          >
            {cards.map((card) => (
              <View
                key={card.id}
                style={{ width: 180 }}
                className="bg-white rounded-lg p-3 border border-gray-100"
              >
                <Text className="text-xs text-gray-700 text-center" style={ta}>
                  {card.bestFor}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={rtlRootDirection(rtl)}
          contentContainerStyle={mergeScrollContentRtl(rtl, {
            gap: 12,
            paddingLeft: rtl ? 0 : 118,
            paddingRight: rtl ? 118 : 0,
            ...rtlRow(rtl),
          })}
        >
          {cards.map((card) => (
            <View key={card.id} style={{ width: 180 }}>
              <Pressable
                onPress={() => router.push(`/marketplace/product/${card.id}`)}
              >
                <Button
                  size="sm"
                  fullWidth
                  variant={card.isBestValue ? 'accent' : 'primary'}
                  onPress={() =>
                    router.push(`/marketplace/product/${card.id}`)
                  }
                >
                  View Details
                </Button>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <Card className="bg-blue-50 border border-blue-200">
          <Text className="text-gray-800 font-semibold mb-2" style={ta}>
            💡 Comparison Tips
          </Text>
          <View className="gap-1">
            <Text className="text-xs text-gray-700" style={ta}>
              • Lower APR wins if you carry a balance
            </Text>
            <Text className="text-xs text-gray-700" style={ta}>
              • Annual fee worth it? Check benefits vs. spend
            </Text>
            <Text className="text-xs text-gray-700" style={ta}>
              • Match rewards to your spending habits
            </Text>
          </View>
        </Card>

        <Button
          variant="outline"
          onPress={() => {
            clearSelection();
            router.replace('/marketplace/credit-cards');
          }}
        >
          Start Over
        </Button>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
