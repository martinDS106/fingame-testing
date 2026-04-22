import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { formatEGP } from '@/lib/format';
import {
  useInvestmentStore,
  useUserStore,
  type Stock,
} from '@/stores';
import { rewardFor } from '@/lib/rewards';
import { useT } from '@/hooks/useT';

type TradeMode = 'buy' | 'sell';

interface TradeModalProps {
  stock: Stock | null;
  onClose: () => void;
}

export function TradeModal({ stock, onClose }: TradeModalProps) {
  const { t } = useT();
  const [mode, setMode] = useState<TradeMode>('buy');
  const [shares, setShares] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cash = useInvestmentStore((s) => s.cash);
  const holding = useInvestmentStore((s) =>
    stock ? s.holdings.find((h) => h.symbol === stock.symbol) : undefined
  );
  const buy = useInvestmentStore((s) => s.buy);
  const sell = useInvestmentStore((s) => s.sell);
  const addCoins = useUserStore((s) => s.addCoins);
  const addXP = useUserStore((s) => s.addXP);

  useEffect(() => {
    if (stock) {
      setMode('buy');
      setShares('');
      setError(null);
    }
  }, [stock?.symbol]);

  const sharesNum = useMemo(() => {
    const n = parseInt(shares, 10);
    return Number.isFinite(n) ? n : 0;
  }, [shares]);

  const totalCost = stock ? stock.price * sharesNum : 0;

  const handleConfirm = () => {
    if (!stock) return;
    setError(null);
    if (sharesNum <= 0) {
      setError(t('trade.enterValidShares'));
      return;
    }

    const result = mode === 'buy' ? buy(stock.symbol, sharesNum) : sell(stock.symbol, sharesNum);
    if (!result.ok) {
      setError(result.reason ?? t('trade.failed'));
      return;
    }

    const action = mode === 'buy' ? t('trade.bought') : t('trade.sold');
    const reward = rewardFor('simulation_win');
    const reward_coins = Math.round(reward.coins / 10);
    addCoins(reward_coins, 'simulation_win');
    addXP(Math.round(reward.xp / 10));

    Alert.alert(
      t('trade.executed'),
      t('trade.alertBody', {
        action,
        qty: sharesNum,
        symbol: stock.symbol,
        price: formatEGP(stock.price),
        coins: reward_coins,
      })
    );
    setShares('');
    onClose();
  };

  return (
    <Modal
      visible={stock !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View className="bg-white rounded-t-3xl p-5 pb-8">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-xl text-gray-900 font-bold">
                    {stock?.symbol}
                  </Text>
                  <Text className="text-xs text-gray-500" numberOfLines={1}>
                    {stock?.name}
                  </Text>
                </View>
                <Pressable
                  onPress={onClose}
                  hitSlop={12}
                  className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
                >
                  <X size={18} color={colors.gray[700]} />
                </Pressable>
              </View>

              <View className="bg-gray-50 rounded-xl p-3 mb-4 flex-row justify-between">
                <View>
                  <Text className="text-xs text-gray-600">{t('trade.price')}</Text>
                  <Text className="text-lg text-gray-900 font-semibold">
                    {formatEGP(stock?.price ?? 0)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-600">{t('trade.cash')}</Text>
                  <Text className="text-lg text-primary-700 font-semibold">
                    {formatEGP(cash)}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2 mb-4">
                <Pressable
                  onPress={() => setMode('buy')}
                  className={`flex-1 items-center py-3 rounded-xl border ${
                    mode === 'buy'
                      ? 'bg-green-600 border-green-600'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={
                      mode === 'buy'
                        ? 'text-white font-semibold'
                        : 'text-gray-700 font-semibold'
                    }
                  >
                    {t('trade.buy')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode('sell')}
                  className={`flex-1 items-center py-3 rounded-xl border ${
                    mode === 'sell'
                      ? 'bg-red-600 border-red-600'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={
                      mode === 'sell'
                        ? 'text-white font-semibold'
                        : 'text-gray-700 font-semibold'
                    }
                  >
                    {t('trade.sell')}
                  </Text>
                </Pressable>
              </View>

              {holding && (
                <View className="bg-blue-50 rounded-lg p-3 mb-3">
                  <Text className="text-xs text-gray-600">{t('trade.youOwn')}</Text>
                  <Text className="text-sm text-primary-700 font-semibold">
                    {t('trade.sharesAtAvg', {
                      shares: holding.shares,
                      avgPrice: formatEGP(holding.avgCost),
                    })}
                  </Text>
                </View>
              )}

              <Text className="text-sm text-gray-700 mb-2 font-medium">
                {t('trade.numberOfShares')}
              </Text>
              <TextInput
                value={shares}
                onChangeText={setShares}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.gray[400]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-2xl text-gray-900 mb-3"
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {[1, 5, 10, 25, 50].map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setShares(String(p))}
                    className="px-4 py-2 rounded-full bg-gray-100"
                  >
                    <Text className="text-gray-800 font-medium">{p}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View className="bg-gray-50 rounded-lg p-3 mt-4 flex-row justify-between">
                <Text className="text-sm text-gray-600">
                  {mode === 'buy' ? t('trade.totalCost') : t('trade.proceeds')}
                </Text>
                <Text className="text-base text-gray-900 font-semibold">
                  {formatEGP(totalCost)}
                </Text>
              </View>

              {error && (
                <View className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              )}

              <View className="mt-5">
                <Button
                  variant={mode === 'buy' ? 'primary' : 'destructive'}
                  fullWidth
                  onPress={handleConfirm}
                  disabled={sharesNum <= 0}
                >
                  {mode === 'buy' ? t('trade.buyShares') : t('trade.sellShares')}
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
