import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BarChart3,
  PieChart,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, PressableCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TradeModal } from '@/components/investment/TradeModal';
import { colors } from '@/theme';
import { formatEGP, formatNumber } from '@/lib/format';
import { useMarketEngine } from '@/hooks/useMarketEngine';
import { useInvestmentStore, useUserStore, type Stock } from '@/stores';

type Tab = 'portfolio' | 'market';

const SECTOR_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#a855f7',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
];

export default function InvestmentSimulationScreen() {
  const [tab, setTab] = useState<Tab>('portfolio');
  const [tradeStock, setTradeStock] = useState<Stock | null>(null);
  const router = useRouter();
  useMarketEngine(6000);

  const cash = useInvestmentStore((s) => s.cash);
  const stocks = useInvestmentStore((s) => s.stocks);
  const holdings = useInvestmentStore((s) => s.holdings);
  const portfolioValue = useInvestmentStore((s) => s.portfolioValue());
  const pnl = useInvestmentStore((s) => s.totalPnL());
  const coins = useUserStore((s) => s.coins);

  const totalValue = cash + portfolioValue;
  const pnlPct =
    portfolioValue > 0 ? (pnl / (portfolioValue - pnl || 1)) * 100 : 0;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Investment"
        showBack
        showBell={false}
        gradient={['#16a34a', '#15803d']}
        rightSlot={
          <View className="flex-row items-center gap-1.5 bg-accent-400 px-3 py-1 rounded-full">
            <Star
              size={14}
              color={colors.primary[900]}
              fill={colors.primary[900]}
            />
            <Text className="text-primary-900 text-sm font-semibold">
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
        <Card className="border border-gray-200 bg-white">
          <Text className="text-xs text-gray-600">
            BRD: Each user starts with EGP 100,000 virtual cash. Market includes 5
            predefined stocks. Admin can override prices from the Admin dashboard.
          </Text>
        </Card>

        <LinearGradient
          colors={['#16a34a', '#15803d']}
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
          <Text className="text-green-100 text-sm mb-1">
            Total Account Value
          </Text>
          <Text className="text-4xl text-white font-bold mb-1">
            {formatEGP(totalValue)}
          </Text>
          <Text className="text-green-100 text-xs mb-4">
            Cash: {formatEGP(cash)} · Positions: {formatEGP(portfolioValue)}
          </Text>

          <View
            className="flex-row items-center gap-2 p-3 rounded-lg"
            style={{
              backgroundColor:
                pnl >= 0 ? 'rgba(255,255,255,0.25)' : 'rgba(239,68,68,0.25)',
            }}
          >
            {pnl >= 0 ? (
              <TrendingUp size={20} color={colors.white} />
            ) : (
              <TrendingDown size={20} color={colors.white} />
            )}
            <View>
              <Text className="text-xs text-green-100">Unrealized P&L</Text>
              <Text className="text-lg text-white font-semibold">
                {pnl >= 0 ? '+' : ''}
                {formatEGP(pnl)} ({pnlPct.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="flex-row bg-gray-100 rounded-xl p-1">
          <Pressable
            onPress={() => setTab('portfolio')}
            className={`flex-1 items-center py-2 rounded-lg ${
              tab === 'portfolio' ? 'bg-white' : ''
            }`}
            style={
              tab === 'portfolio'
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 2,
                  }
                : {}
            }
          >
            <Text
              className={
                tab === 'portfolio'
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600 font-medium'
              }
            >
              My Holdings ({holdings.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('market')}
            className={`flex-1 items-center py-2 rounded-lg ${
              tab === 'market' ? 'bg-white' : ''
            }`}
            style={
              tab === 'market'
                ? {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 2,
                  }
                : {}
            }
          >
            <Text
              className={
                tab === 'market'
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600 font-medium'
              }
            >
              Market
            </Text>
          </Pressable>
        </View>

        {tab === 'portfolio' && (
          <>
            {holdings.length === 0 ? (
              <Card className="items-center py-8">
                <Text className="text-5xl mb-3">📊</Text>
                <Text className="text-lg text-gray-800 font-semibold mb-1">
                  No holdings yet
                </Text>
                <Text className="text-sm text-gray-500 text-center mb-2">
                  Switch to Market to buy your first stock.
                </Text>
              </Card>
            ) : (
              <>
                <Card>
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-800 font-semibold">
                      Asset Allocation
                    </Text>
                    <PieChart size={18} color={colors.gray[600]} />
                  </View>
                  <View className="gap-2">
                    {holdings.map((h, i) => {
                      const stock = stocks.find((s) => s.symbol === h.symbol);
                      if (!stock) return null;
                      const value = stock.price * h.shares;
                      const pct =
                        portfolioValue > 0 ? (value / portfolioValue) * 100 : 0;
                      return (
                        <View key={h.symbol}>
                          <View className="flex-row justify-between mb-1">
                            <Text className="text-sm text-gray-700 font-medium">
                              {h.symbol}
                            </Text>
                            <Text className="text-sm text-gray-600">
                              {pct.toFixed(1)}%
                            </Text>
                          </View>
                          <ProgressBar
                            value={pct}
                            height={6}
                            color={SECTOR_COLORS[i % SECTOR_COLORS.length]}
                          />
                        </View>
                      );
                    })}
                  </View>
                </Card>

                <View className="gap-3">
                  {holdings.map((h) => {
                    const stock = stocks.find((s) => s.symbol === h.symbol);
                    if (!stock) return null;
                    const value = stock.price * h.shares;
                    const positionPnL = (stock.price - h.avgCost) * h.shares;
                    const positionPct =
                      h.avgCost > 0
                        ? ((stock.price - h.avgCost) / h.avgCost) * 100
                        : 0;
                    const isUp = positionPnL >= 0;

                    return (
                      <PressableCard
                        key={h.symbol}
                        onPress={() =>
                          router.push(`/investment/${h.symbol}` as never)
                        }
                        onLongPress={() => setTradeStock(stock)}
                      >
                        <View className="flex-row items-start justify-between mb-2">
                          <View className="flex-1 pr-2">
                            <Text className="text-base text-gray-900 font-semibold">
                              {stock.symbol}
                            </Text>
                            <Text
                              className="text-xs text-gray-500"
                              numberOfLines={1}
                            >
                              {stock.name}
                            </Text>
                          </View>
                          <View
                            className="flex-row items-center gap-1 px-2 py-1 rounded-md"
                            style={{
                              backgroundColor: isUp ? '#dcfce7' : '#fee2e2',
                            }}
                          >
                            {isUp ? (
                              <TrendingUp size={14} color="#16a34a" />
                            ) : (
                              <TrendingDown size={14} color="#dc2626" />
                            )}
                            <Text
                              className={
                                isUp
                                  ? 'text-xs font-semibold text-green-700'
                                  : 'text-xs font-semibold text-red-700'
                              }
                            >
                              {isUp ? '+' : ''}
                              {positionPct.toFixed(2)}%
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-gray-600">
                            {h.shares} shares @ {formatEGP(h.avgCost)}
                          </Text>
                          <Text className="text-sm text-gray-900 font-semibold">
                            {formatEGP(value)}
                          </Text>
                        </View>
                      </PressableCard>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}

        {tab === 'market' && (
          <View className="gap-3">
            {stocks.map((stock) => {
              const isUp = stock.changePct >= 0;
              const owned = holdings.find((h) => h.symbol === stock.symbol);

              return (
                <PressableCard
                  key={stock.symbol}
                  onPress={() =>
                    router.push(`/investment/${stock.symbol}` as never)
                  }
                  onLongPress={() => setTradeStock(stock)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <View className="flex-row items-center gap-2 mb-0.5">
                        <Text className="text-base text-gray-900 font-semibold">
                          {stock.symbol}
                        </Text>
                        {owned && (
                          <View className="bg-primary-100 px-1.5 py-0.5 rounded">
                            <Text className="text-[10px] text-primary-700 font-bold">
                              OWNED
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        className="text-xs text-gray-500"
                        numberOfLines={1}
                      >
                        {stock.name} · {stock.sector}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-base text-gray-900 font-semibold">
                        {formatEGP(stock.price)}
                      </Text>
                      <Text
                        className={
                          isUp
                            ? 'text-xs font-semibold text-green-700'
                            : 'text-xs font-semibold text-red-700'
                        }
                      >
                        {isUp ? '+' : ''}
                        {stock.changePct.toFixed(2)}%
                      </Text>
                    </View>
                    <BarChart3 size={18} color={colors.gray[400]} />
                  </View>
                </PressableCard>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TradeModal stock={tradeStock} onClose={() => setTradeStock(null)} />
    </View>
  );
}
