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
  useGoldStore,
  useUserStore,
  type MetalPrice,
} from '@/stores';
import { rewardFor } from '@/lib/rewards';
import { useT } from '@/hooks/useT';
import {
  rtlRootDirection,
  rtlRowMerge,
  rtlTextStyle,
  mergeScrollContentRtl,
  rtlRow,
} from '@/lib/rtlStyle';

type Mode = 'buy' | 'sell';

interface GoldTradeModalProps {
  metal: MetalPrice | null;
  onClose: () => void;
}

export function GoldTradeModal({ metal, onClose }: GoldTradeModalProps) {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const [mode, setMode] = useState<Mode>('buy');
  const [grams, setGrams] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cash = useGoldStore((s) => s.cash);
  const holding = useGoldStore((s) =>
    metal ? s.holdings.find((h) => h.type === metal.type) : undefined
  );
  const buy = useGoldStore((s) => s.buy);
  const sell = useGoldStore((s) => s.sell);
  const addCoins = useUserStore((s) => s.addCoins);
  const addXP = useUserStore((s) => s.addXP);

  useEffect(() => {
    if (metal) {
      setMode('buy');
      setGrams('');
      setError(null);
    }
  }, [metal]);

  const gramsNum = useMemo(() => {
    const n = parseFloat(grams);
    return Number.isFinite(n) ? n : 0;
  }, [grams]);

  const totalCost = metal ? metal.pricePerGram * gramsNum : 0;

  const handleConfirm = () => {
    void (async () => {
      if (!metal) return;
      setError(null);
      if (gramsNum <= 0) {
        setError(t('gold.enterValidGrams'));
        return;
      }

      const result =
        mode === 'buy' ? buy(metal.type, gramsNum) : sell(metal.type, gramsNum);
      if (!result.ok) {
        setError(result.reason ?? t('trade.failed'));
        return;
      }

      const action = mode === 'buy' ? t('trade.bought') : t('trade.sold');
      const reward = rewardFor('simulation_win');
      const coinsReward = Math.round(reward.coins / 15);
      const xpReward = Math.round(reward.xp / 15);
      const okCoins = await addCoins(coinsReward, 'simulation_win');
      if (!okCoins) {
        Alert.alert(
          t('trade.executed'),
          t('gold.alertBody', {
            action,
            qty: gramsNum,
            label: metal.label,
            coins: 0,
          }) + '\n\nCould not sync coin reward.',
        );
        setGrams('');
        onClose();
        return;
      }
      const okXp = await addXP(xpReward);
      if (!okXp) {
        await useUserStore.getState().spendCoins(coinsReward, 'simulation_win');
        Alert.alert(
          t('trade.executed'),
          t('gold.alertBody', {
            action,
            qty: gramsNum,
            label: metal.label,
            coins: coinsReward,
          }) + '\n\nCould not sync XP reward.',
        );
        setGrams('');
        onClose();
        return;
      }

      Alert.alert(
        t('trade.executed'),
        t('gold.alertBody', {
          action,
          qty: gramsNum,
          label: metal.label,
          coins: coinsReward,
        })
      );
      setGrams('');
      onClose();
    })();
  };

  return (
    <Modal
      visible={metal !== null}
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
            <View className="bg-white rounded-t-3xl p-5 pb-8" style={rtlRootDirection(rtl)}>
              <View
                className="mb-4"
                style={rtlRowMerge(rtl, {
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <Text style={ta} className="text-xl text-gray-900 font-bold">
                  {metal?.label}
                </Text>
                <Pressable
                  onPress={onClose}
                  hitSlop={12}
                  className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
                >
                  <X size={18} color={colors.gray[700]} />
                </Pressable>
              </View>

              <View
                className="bg-gray-50 rounded-xl p-3 mb-4"
                style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}
              >
                <View>
                  <Text style={ta} className="text-xs text-gray-600">
                    {t('gold.pricePerGram')}
                  </Text>
                  <Text style={ta} className="text-lg text-gray-900 font-semibold">
                    {formatEGP(metal?.pricePerGram ?? 0)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text style={ta} className="text-xs text-gray-600">
                    {t('trade.cash')}
                  </Text>
                  <Text style={ta} className="text-lg text-primary-700 font-semibold">
                    {formatEGP(cash)}
                  </Text>
                </View>
              </View>

              <View className="mb-4" style={rtlRowMerge(rtl, { gap: 8 })}>
                {(['buy', 'sell'] as Mode[]).map((m) => {
                  const active = mode === m;
                  const isBuy = m === 'buy';
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setMode(m)}
                      className={`flex-1 items-center py-3 rounded-xl border ${
                        active
                          ? isBuy
                            ? 'bg-green-600 border-green-600'
                            : 'bg-red-600 border-red-600'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text
                        style={ta}
                        className={
                          active
                            ? 'text-white font-semibold'
                            : 'text-gray-700 font-semibold'
                        }
                      >
                        {isBuy ? t('gold.buy') : t('gold.sell')}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {holding && (
                <View className="bg-accent-50 rounded-lg p-3 mb-3">
                  <Text style={ta} className="text-xs text-gray-600">
                    {t('trade.youOwn')}
                  </Text>
                  <Text style={ta} className="text-sm text-accent-800 font-semibold">
                    {t('gold.holdingAtAvg', {
                      grams: holding.grams,
                      avgPrice: formatEGP(holding.avgCost),
                    })}
                  </Text>
                </View>
              )}

              <Text style={ta} className="text-sm text-gray-700 mb-2 font-medium">
                {t('gold.amountGrams')}
              </Text>
              <TextInput
                value={grams}
                onChangeText={setGrams}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.gray[400]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-2xl text-gray-900 mb-3"
                style={{
                  textAlign: rtl ? 'right' : 'left',
                  writingDirection: rtl ? 'rtl' : 'ltr',
                }}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={rtlRootDirection(rtl)}
                contentContainerStyle={mergeScrollContentRtl(rtl, {
                  gap: 8,
                  ...rtlRow(rtl),
                })}
              >
                {[0.5, 1, 5, 10, 25].map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setGrams(String(p))}
                    className="px-4 py-2 rounded-full bg-gray-100"
                  >
                    <Text style={ta} className="text-gray-800 font-medium">
                      {p}g
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View
                className="bg-gray-50 rounded-lg p-3 mt-4"
                style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}
              >
                <Text style={ta} className="text-sm text-gray-600">
                  {mode === 'buy' ? t('trade.totalCost') : t('trade.proceeds')}
                </Text>
                <Text style={ta} className="text-base text-gray-900 font-semibold">
                  {formatEGP(totalCost)}
                </Text>
              </View>

              {error && (
                <View className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <Text style={ta} className="text-sm text-red-700">
                    {error}
                  </Text>
                </View>
              )}

              <View className="mt-5">
                <Button
                  variant={mode === 'buy' ? 'accent' : 'destructive'}
                  fullWidth
                  onPress={handleConfirm}
                  disabled={gramsNum <= 0}
                >
                  {mode === 'buy' ? t('gold.buy') : t('gold.sell')}
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
