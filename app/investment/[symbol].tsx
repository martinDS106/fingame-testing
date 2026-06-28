import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriceChart } from '@/components/investment/PriceChart';
import { colors } from '@/theme';
import { formatEGP } from '@/lib/format';
import { useMarketEngine } from '@/hooks/useMarketEngine';
import { useInvestmentStore, useUserStore } from '@/stores';
import { rewardFor } from '@/lib/rewards';
import { notifySuccess } from '@/lib/celebration';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';

type Mode = 'market' | 'limit' | 'stop_loss';
type Side = 'buy' | 'sell';

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  useMarketEngine(4000);

  const stocks = useInvestmentStore((s) => s.stocks);
  const holdings = useInvestmentStore((s) => s.holdings);
  const cash = useInvestmentStore((s) => s.cash);
  const priceHistory = useInvestmentStore((s) => s.priceHistory);
  const orders = useInvestmentStore((s) => s.orders);
  const buy = useInvestmentStore((s) => s.buy);
  const sell = useInvestmentStore((s) => s.sell);
  const placeOrder = useInvestmentStore((s) => s.placeOrder);
  const cancelOrder = useInvestmentStore((s) => s.cancelOrder);
  const addCoins = useUserStore((s) => s.addCoins);

  const stock = useMemo(
    () => stocks.find((s) => s.symbol === symbol),
    [stocks, symbol]
  );
  const holding = useMemo(
    () => (symbol ? holdings.find((h) => h.symbol === symbol) : undefined),
    [holdings, symbol]
  );
  const history = priceHistory[symbol ?? ''] ?? [];
  const openOrders = useMemo(
    () =>
      orders.filter(
        (o) => o.symbol === symbol && o.status === 'open'
      ),
    [orders, symbol]
  );

  const [side, setSide] = useState<Side>('buy');
  const [mode, setMode] = useState<Mode>('market');
  const [sharesStr, setSharesStr] = useState('');
  const [triggerStr, setTriggerStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!stock) {
    return (
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader title="Stock" showBack showBell={false} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600" style={ta}>
            Stock not found
          </Text>
          <Button
            variant="outline"
            className="mt-3"
            onPress={() => router.back()}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  const isUp = stock.changePct >= 0;
  const shares = parseInt(sharesStr, 10) || 0;
  const trigger = parseFloat(triggerStr) || 0;
  const estCost =
    mode === 'market'
      ? stock.price * shares
      : trigger * shares;

  const onExecute = () => {
    setError(null);
    if (shares <= 0) {
      setError('Enter a valid number of shares.');
      return;
    }

    if (mode === 'market') {
      const result = side === 'buy' ? buy(stock.symbol, shares) : sell(stock.symbol, shares);
      if (!result.ok) {
        setError(result.reason ?? 'Trade failed.');
        return;
      }
      const reward = Math.round(rewardFor('simulation_win').coins / 10);
      void (async () => {
        const ok = await addCoins(reward, 'simulation_win');
        notifySuccess(
          'Trade executed',
          `${side === 'buy' ? 'Bought' : 'Sold'} ${shares} ${stock.symbol} @ ${formatEGP(
            stock.price
          )}\n\n${ok ? `+${reward} coins` : 'Trade saved locally, but coin reward did not sync.'}`,
        );
      })();
      setSharesStr('');
      return;
    }

    if (trigger <= 0) {
      setError('Enter a valid trigger price.');
      return;
    }

    const orderType = mode === 'limit' ? 'limit' : 'stop_loss';
    const effectiveSide = mode === 'stop_loss' ? 'sell' : side;
    const res = placeOrder(stock.symbol, effectiveSide, orderType, shares, trigger);
    if (!res.ok) {
      setError(res.reason ?? 'Order failed.');
      return;
    }
    notifySuccess(
      'Order placed',
      `${orderType === 'limit' ? 'Limit' : 'Stop-Loss'} ${effectiveSide.toUpperCase()} order for ${shares} ${stock.symbol} at ${formatEGP(trigger)} is open.`,
    );
    setSharesStr('');
    setTriggerStr('');
  };

  const chartWidth = Math.min(Dimensions.get('window').width - 32, 360);

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={`${stock.symbol} · ${stock.name}`}
        showBack
        showBell={false}
        gradient={['#16a34a', '#15803d']}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 16 })}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[isUp ? '#16a34a' : '#dc2626', isUp ? '#15803d' : '#991b1b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 20 }}
        >
          <Text className="text-white/80 text-xs" style={ta}>
            Current Price
          </Text>
          <Text className="text-4xl text-white font-bold" style={ta}>
            {formatEGP(stock.price)}
          </Text>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 4, marginTop: 4 })}>
            {isUp ? (
              <TrendingUp size={16} color={colors.white} />
            ) : (
              <TrendingDown size={16} color={colors.white} />
            )}
            <Text className="text-white text-sm font-semibold" style={ta}>
              {isUp ? '+' : ''}
              {stock.change.toFixed(2)} ({stock.changePct.toFixed(2)}%)
            </Text>
          </View>
          <Text className="text-white/70 text-xs mt-2" style={ta}>
            Sector: {stock.sector}
          </Text>
        </LinearGradient>

        <Card>
          <Text className="text-gray-800 font-semibold mb-2" style={ta}>
            Price History
          </Text>
          <View className="items-center">
            <PriceChart prices={history} width={chartWidth} height={180} />
          </View>
          <Text className="text-xs text-gray-500 text-center mt-1" style={ta}>
            {history.length > 1
              ? `${history.length} ticks shown · auto-refresh every 4s`
              : 'Collecting data... first tick incoming'}
          </Text>
        </Card>

        {holding && (
          <Card>
            <Text className="text-gray-800 font-semibold mb-2" style={ta}>
              Your Position
            </Text>
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between', marginBottom: 4 })}>
              <Text className="text-gray-600 text-sm" style={ta}>
                Shares
              </Text>
              <Text className="text-gray-900 font-semibold" style={ta}>
                {holding.shares}
              </Text>
            </View>
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between', marginBottom: 4 })}>
              <Text className="text-gray-600 text-sm" style={ta}>
                Avg Cost
              </Text>
              <Text className="text-gray-900 font-semibold" style={ta}>
                {formatEGP(holding.avgCost)}
              </Text>
            </View>
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between', marginBottom: 4 })}>
              <Text className="text-gray-600 text-sm" style={ta}>
                Market Value
              </Text>
              <Text className="text-gray-900 font-semibold" style={ta}>
                {formatEGP(stock.price * holding.shares)}
              </Text>
            </View>
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
              <Text className="text-gray-600 text-sm" style={ta}>
                Unrealized P&L
              </Text>
              <Text
                className={
                  stock.price >= holding.avgCost
                    ? 'text-green-700 font-semibold'
                    : 'text-red-700 font-semibold'
                }
                style={ta}
              >
                {formatEGP((stock.price - holding.avgCost) * holding.shares)}
              </Text>
            </View>
          </Card>
        )}

        <Card>
          <Text className="text-gray-800 font-semibold mb-3" style={ta}>
            Place Order
          </Text>

          <View style={rtlRowMerge(rtl, { gap: 8, marginBottom: 12 })}>
            <Pressable
              onPress={() => setSide('buy')}
              className={`flex-1 items-center py-2.5 rounded-xl border ${
                side === 'buy' ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={side === 'buy' ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}
                style={ta}
              >
                Buy
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSide('sell')}
              className={`flex-1 items-center py-2.5 rounded-xl border ${
                side === 'sell' ? 'bg-red-600 border-red-600' : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={side === 'sell' ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}
                style={ta}
              >
                Sell
              </Text>
            </Pressable>
          </View>

          <View className="bg-gray-100 rounded-xl p-1 mb-3" style={rtlRowMerge(rtl)}>
            {(['market', 'limit', 'stop_loss'] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                className={`flex-1 items-center py-2 rounded-lg ${
                  mode === m ? 'bg-white' : ''
                }`}
              >
                <Text
                  className={
                    mode === m
                      ? 'text-gray-900 font-semibold text-xs'
                      : 'text-gray-600 font-medium text-xs'
                  }
                  style={ta}
                >
                  {m === 'market' ? 'Market' : m === 'limit' ? 'Limit' : 'Stop-Loss'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-xs text-gray-500 mb-3" style={ta}>
            {mode === 'market' &&
              'Executes immediately at the current price.'}
            {mode === 'limit' &&
              (side === 'buy'
                ? 'Auto-buys if price drops to or below your trigger.'
                : 'Auto-sells if price rises to or above your trigger.')}
            {mode === 'stop_loss' &&
              'Auto-sells if price drops to your stop trigger (protects against losses).'}
          </Text>

          <Text className="text-sm text-gray-700 mb-1 font-medium" style={ta}>
            Number of shares
          </Text>
          <TextInput
            value={sharesStr}
            onChangeText={setSharesStr}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.gray[400]}
            className="border border-gray-200 rounded-xl px-4 py-3 text-xl text-gray-900 mb-3"
            style={ta}
          />

          {mode !== 'market' && (
            <>
              <Text className="text-sm text-gray-700 mb-1 font-medium" style={ta}>
                Trigger price (EGP)
              </Text>
              <TextInput
                value={triggerStr}
                onChangeText={setTriggerStr}
                keyboardType="decimal-pad"
                placeholder={stock.price.toFixed(2)}
                placeholderTextColor={colors.gray[400]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-xl text-gray-900 mb-3"
                style={ta}
              />
            </>
          )}

          <View
            className="bg-gray-50 rounded-lg p-3 mb-3"
            style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}
          >
            <Text className="text-sm text-gray-600" style={ta}>
              {mode === 'market' ? 'Estimated' : 'At trigger'}
            </Text>
            <Text className="text-base text-gray-900 font-semibold" style={ta}>
              {formatEGP(estCost)}
            </Text>
          </View>
          <View style={rtlRowMerge(rtl, { justifyContent: 'space-between', marginBottom: 12 })}>
            <Text className="text-xs text-gray-500" style={ta}>
              Cash available
            </Text>
            <Text className="text-xs text-gray-700 font-medium" style={ta}>
              {formatEGP(cash)}
            </Text>
          </View>

          {error && (
            <View className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <Text className="text-sm text-red-700" style={ta}>
                {error}
              </Text>
            </View>
          )}

          <Button
            variant={side === 'buy' ? 'primary' : 'destructive'}
            fullWidth
            onPress={onExecute}
            disabled={shares <= 0}
          >
            {mode === 'market'
              ? side === 'buy'
                ? 'Buy Now'
                : 'Sell Now'
              : mode === 'limit'
                ? `Place Limit ${side.toUpperCase()}`
                : 'Place Stop-Loss'}
          </Button>
        </Card>

        {openOrders.length > 0 && (
          <Card>
            <Text className="text-gray-800 font-semibold mb-3" style={ta}>
              Open Orders ({openOrders.length})
            </Text>
            <View className="gap-2">
              {openOrders.map((o) => (
                <View
                  key={o.id}
                  className="bg-gray-50 rounded-lg p-3"
                  style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between' })}
                >
                  <View className="flex-1">
                    <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 4 })}>
                      <Badge
                        variant={o.side === 'buy' ? 'success' : 'warning'}
                      >
                        {o.side.toUpperCase()}
                      </Badge>
                      <Text className="text-xs text-gray-500" style={ta}>
                        {o.type === 'limit' ? 'Limit' : 'Stop-Loss'}
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-900 font-medium" style={ta}>
                      {o.shares} shares @ {formatEGP(o.triggerPrice)}
                    </Text>
                    <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 4, marginTop: 2 })}>
                      <Clock size={11} color={colors.gray[500]} />
                      <Text className="text-[11px] text-gray-500" style={ta}>
                        {new Date(o.createdAt).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => cancelOrder(o.id)}
                    hitSlop={10}
                    className="w-8 h-8 rounded-full items-center justify-center bg-red-100"
                  >
                    <X size={16} color="#dc2626" />
                  </Pressable>
                </View>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
