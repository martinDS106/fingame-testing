import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  Repeat,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react-native';
import { router } from 'expo-router';
import type { ComponentType } from 'react';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TxnActionModal, type TxnAction } from '@/components/banking/TxnActionModal';
import { colors } from '@/theme';
import { formatEGP, formatNumber } from '@/lib/format';
import { metaFor } from '@/lib/txnMeta';
import { useBankingStore, useUserStore } from '@/stores';

interface QuickAction {
  key: TxnAction;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  bg: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    key: 'deposit',
    label: 'Deposit',
    Icon: ArrowDownCircle,
    bg: '#dcfce7',
    color: '#16a34a',
  },
  {
    key: 'withdraw',
    label: 'Withdraw',
    Icon: ArrowUpCircle,
    bg: '#fee2e2',
    color: '#dc2626',
  },
  {
    key: 'pay_bill',
    label: 'Pay Bill',
    Icon: Receipt,
    bg: '#fef9c3',
    color: colors.accent[600],
  },
  {
    key: 'transfer',
    label: 'Transfer',
    Icon: Repeat,
    bg: colors.primary[100],
    color: colors.primary[600],
  },
];

function computeHealthScore(
  totalBalance: number,
  savings: number,
  txnCount: number
): number {
  const savingsRatio = totalBalance > 0 ? savings / totalBalance : 0;
  const base = 40 + Math.round(savingsRatio * 50);
  const activity = Math.min(10, txnCount);
  return Math.max(0, Math.min(100, base + activity));
}

export default function BankingSimulationScreen() {
  const accounts = useBankingStore((s) => s.accounts);
  const transactions = useBankingStore((s) => s.transactions);
  const totalBalance = useBankingStore((s) => s.totalBalance());
  const coins = useUserStore((s) => s.coins);

  const wallet = accounts.find((a) => a.type === 'checking')?.balance ?? 0;
  const savings = accounts.find((a) => a.type === 'savings')?.balance ?? 0;
  const health = computeHealthScore(totalBalance, savings, transactions.length);
  const recent = transactions.slice(0, 4);

  const [modalAction, setModalAction] = useState<TxnAction | null>(null);

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Virtual Bank"
        showBack
        showBell={false}
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
        <LinearGradient
          colors={[colors.primary[600], colors.primary[700]]}
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
          <Text className="text-primary-100 text-sm mb-1">Total Balance</Text>
          <Text className="text-4xl text-white font-bold mb-4">
            {formatEGP(totalBalance)}
          </Text>

          <View className="flex-row gap-3">
            <View
              className="flex-1 rounded-lg p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-xs text-primary-100">Wallet</Text>
              <Text className="text-lg text-white font-semibold">
                {formatEGP(wallet)}
              </Text>
            </View>
            <View
              className="flex-1 rounded-lg p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-xs text-primary-100">Savings</Text>
              <Text className="text-lg text-white font-semibold">
                {formatEGP(savings)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="flex-row flex-wrap -m-1.5">
          {quickActions.map(({ key, label, Icon, bg, color }) => (
            <View key={key} style={{ width: '50%' }} className="p-1.5">
              <PressableCard onPress={() => setModalAction(key)}>
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={22} color={color} />
                </View>
                <Text className="text-sm text-gray-800 font-medium">
                  {label}
                </Text>
              </PressableCard>
            </View>
          ))}
        </View>

        <PressableCard
          onPress={() => router.push('/simulation/savings-goal' as never)}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: '#f3e8ff' }}
            >
              <Target size={22} color="#9333ea" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold">Savings Goals</Text>
              <Text className="text-sm text-gray-600">
                Track and grow your goals
              </Text>
            </View>
            <Text className="text-purple-600 font-semibold">›</Text>
          </View>
        </PressableCard>

        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-800 font-semibold">
              Financial Health Score
            </Text>
            <TrendingUp size={20} color="#16a34a" />
          </View>
          <View className="flex-row items-end gap-2 mb-2">
            <Text className="text-4xl text-primary-600 font-bold">
              {health}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">/ 100</Text>
          </View>
          <ProgressBar
            value={health}
            height={8}
            gradient={['#4ade80', '#16a34a']}
          />
          <Text className="text-sm text-gray-600 mt-3">
            {health >= 80
              ? 'Excellent! Keep building that savings buffer.'
              : health >= 60
                ? 'Good shape. A little more savings and you\u2019re there.'
                : 'Start saving a fixed amount every month to improve.'}
          </Text>
        </Card>

        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-800 font-semibold">Recent Activity</Text>
          </View>
          {recent.length === 0 ? (
            <View className="items-center py-6 gap-2">
              <Text className="text-4xl">💤</Text>
              <Text className="text-sm text-gray-500">
                No transactions yet. Try a quick action above.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {recent.map((tx) => {
                const meta = metaFor(tx.category);
                const isPositive = tx.type === 'deposit';
                const sign = isPositive ? '+' : '-';
                return (
                  <View
                    key={tx.id}
                    className="flex-row items-center gap-3 pb-3 border-b border-gray-100 last:border-b-0"
                  >
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center"
                      style={{ backgroundColor: colors.gray[100] }}
                    >
                      <Text className="text-xl">{meta.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-gray-800 font-medium">
                        {tx.note ?? meta.label}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {meta.label} •{' '}
                        {new Date(tx.at).toLocaleDateString('en-GB')}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-semibold ${
                        isPositive ? 'text-green-600' : 'text-gray-800'
                      }`}
                    >
                      {sign}
                      {formatEGP(tx.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <Pressable
          onPress={() =>
            Alert.alert(
              'Coming soon',
              'Scenario Challenges will drop in the next update!'
            )
          }
          className="active:opacity-90"
        >
          <LinearGradient
            colors={[colors.accent[400], colors.accent[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, padding: 16 }}
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-3xl">🎯</Text>
              <View className="flex-1">
                <Text className="text-primary-900 font-semibold mb-1">
                  Scenario Challenge
                </Text>
                <Text className="text-sm text-primary-800">
                  Test your budgeting with real-life scenarios
                </Text>
              </View>
              <Button variant="secondary" size="sm">
                Start
              </Button>
            </View>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      <TxnActionModal
        action={modalAction}
        onClose={() => setModalAction(null)}
      />
    </View>
  );
}
