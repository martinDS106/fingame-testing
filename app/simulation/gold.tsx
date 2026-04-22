import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, TrendingDown, TrendingUp } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, PressableCard } from '@/components/ui/Card';
import { GoldTradeModal } from '@/components/gold/GoldTradeModal';
import { colors } from '@/theme';
import { formatEGP, formatNumber } from '@/lib/format';
import { useGoldStore, useUserStore, type MetalPrice } from '@/stores';

const METAL_EMOJI: Record<string, string> = {
  gold_24k: '🥇',
  gold_21k: '🏅',
  gold_18k: '🎗️',
  silver: '🥈',
};

export default function GoldSimulationScreen() {
  const [tradeMetal, setTradeMetal] = useState<MetalPrice | null>(null);

  const cash = useGoldStore((s) => s.cash);
  const prices = useGoldStore((s) => s.prices);
  const holdings = useGoldStore((s) => s.holdings);
  const portfolioValue = useGoldStore((s) => s.portfolioValue());
  const pnl = useGoldStore((s) => s.totalPnL());
  const coins = useUserStore((s) => s.coins);

  const totalValue = cash + portfolioValue;
  const pnlPct =
    portfolioValue > 0 ? (pnl / (portfolioValue - pnl || 1)) * 100 : 0;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Gold & Silver"
        showBack
        showBell={false}
        gradient={[colors.accent[500], '#b45309']}
        rightSlot={
          <View className="flex-row items-center gap-1.5 bg-primary-700 px-3 py-1 rounded-full">
            <Star size={14} color={colors.white} fill={colors.white} />
            <Text className="text-white text-sm font-semibold">
              {formatNumber(coins)}
            </Text>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.accent[400], '#d97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text className="text-primary-900/80 text-sm mb-1">
            Total Account Value
          </Text>
          <Text className="text-4xl text-primary-900 font-bold mb-1">
            {formatEGP(totalValue)}
          </Text>
          <Text className="text-primary-900/70 text-xs mb-4">
            Cash: {formatEGP(cash)} · Metals: {formatEGP(portfolioValue)}
          </Text>

          <View
            className="flex-row items-center gap-2 p-3 rounded-lg"
            style={{
              backgroundColor: 'rgba(0,0,0,0.12)',
            }}
          >
            {pnl >= 0 ? (
              <TrendingUp size={20} color={colors.primary[900]} />
            ) : (
              <TrendingDown size={20} color={colors.primary[900]} />
            )}
            <View>
              <Text className="text-xs text-primary-900/80">
                Unrealized P&L
              </Text>
              <Text className="text-lg text-primary-900 font-semibold">
                {pnl >= 0 ? '+' : ''}
                {formatEGP(pnl)} ({pnlPct.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View>
          <Text className="text-lg text-gray-800 font-semibold mb-3">
            Live Prices
          </Text>
          <View className="gap-3">
            {prices.map((metal) => {
              const isUp = metal.changePct >= 0;
              const holding = holdings.find((h) => h.type === metal.type);

              return (
                <PressableCard
                  key={metal.type}
                  onPress={() => setTradeMetal(metal)}
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-4xl">
                      {METAL_EMOJI[metal.type] ?? '💎'}
                    </Text>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-0.5">
                        <Text className="text-base text-gray-900 font-semibold">
                          {metal.label}
                        </Text>
                        {holding && (
                          <View className="bg-accent-100 px-1.5 py-0.5 rounded">
                            <Text className="text-[10px] text-accent-800 font-bold">
                              {holding.grams}g
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-gray-500">
                        Change today
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-base text-gray-900 font-semibold">
                        {formatEGP(metal.pricePerGram)}
                      </Text>
                      <View
                        className="flex-row items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: isUp ? '#dcfce7' : '#fee2e2',
                        }}
                      >
                        {isUp ? (
                          <TrendingUp size={11} color="#16a34a" />
                        ) : (
                          <TrendingDown size={11} color="#dc2626" />
                        )}
                        <Text
                          className={
                            isUp
                              ? 'text-[11px] font-semibold text-green-700'
                              : 'text-[11px] font-semibold text-red-700'
                          }
                        >
                          {isUp ? '+' : ''}
                          {metal.changePct.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </PressableCard>
              );
            })}
          </View>
        </View>

        {holdings.length > 0 && (
          <View>
            <Text className="text-lg text-gray-800 font-semibold mb-3">
              Your Metals
            </Text>
            <View className="gap-3">
              {holdings.map((h) => {
                const price = prices.find((p) => p.type === h.type);
                if (!price) return null;
                const value = price.pricePerGram * h.grams;
                const positionPnL = (price.pricePerGram - h.avgCost) * h.grams;
                const isUp = positionPnL >= 0;

                return (
                  <Card key={h.type}>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-3xl">
                        {METAL_EMOJI[h.type] ?? '💎'}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-base text-gray-900 font-semibold">
                          {price.label}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {h.grams}g @ {formatEGP(h.avgCost)}/g
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-base text-gray-900 font-semibold">
                          {formatEGP(value)}
                        </Text>
                        <Text
                          className={
                            isUp
                              ? 'text-xs font-semibold text-green-700'
                              : 'text-xs font-semibold text-red-700'
                          }
                        >
                          {isUp ? '+' : ''}
                          {formatEGP(positionPnL)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        <Card className="bg-accent-50 border-accent-100">
          <Text className="text-gray-800 font-semibold mb-2">
            💡 How does this work?
          </Text>
          <Text className="text-sm text-gray-600">
            Buy or sell grams of precious metals at live prices. Your holdings
            track average cost and unrealized P&L in real-time.
          </Text>
        </Card>
      </ScrollView>

      <GoldTradeModal
        metal={tradeMetal}
        onClose={() => setTradeMetal(null)}
      />
    </View>
  );
}
