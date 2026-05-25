import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, DollarSign, TrendingUp } from 'lucide-react-native';
import { router } from 'expo-router';

import { BottomNav } from '@/components/BottomNav';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { useUserStore } from '@/stores';
import { rewardFor } from '@/lib/rewards';

interface LoanSummary {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  affordabilityRatio: number;
  isAffordable: boolean;
}

interface AmortRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

function calcLoan(
  amount: number,
  apr: number,
  years: number,
  income: number
): { summary: LoanSummary; schedule: AmortRow[] } {
  const monthlyRate = apr / 100 / 12;
  const numPayments = years * 12;
  const monthlyPayment =
    numPayments > 0 && monthlyRate > 0
      ? (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : amount / Math.max(numPayments, 1);
  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - amount;
  const affordabilityRatio = income > 0 ? (monthlyPayment / income) * 100 : 0;

  // Amortization schedule (monthly breakdown)
  const schedule: AmortRow[] = [];
  let balance = amount;
  for (let m = 1; m <= numPayments; m += 1) {
    const interest = monthlyRate > 0 ? balance * monthlyRate : 0;
    const principal = Math.max(0, monthlyPayment - interest);
    const nextBalance = Math.max(0, balance - principal);
    schedule.push({
      month: m,
      payment: monthlyPayment,
      interest,
      principal,
      balance: nextBalance,
    });
    balance = nextBalance;
    if (balance <= 0) break;
  }

  return {
    summary: {
      monthlyPayment,
      totalPaid,
      totalInterest,
      affordabilityRatio,
      isAffordable: affordabilityRatio > 0 && affordabilityRatio <= 40,
    },
    schedule,
  };
}

const AMOUNT_PRESETS = [50_000, 100_000, 250_000, 500_000];
const APR_PRESETS = [8, 12, 15, 20];
const TERM_OPTIONS = [1, 3, 5, 10];

export default function LoanCalculatorScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const coins = useUserStore((s) => s.coins);
  const hasClaimedReward = useUserStore((s) => s.hasClaimedReward);
  const claimRewardOnce = useUserStore((s) => s.claimRewardOnce);

  const [amount, setAmount] = useState('100000');
  const [apr, setApr] = useState('12');
  const [years, setYears] = useState(5);
  const [income, setIncome] = useState('15000');
  const [showSchedule, setShowSchedule] = useState(false);
  const rewardKey = 'loan_calc_reward_v1';
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const rewarded = rewardClaimed || hasClaimedReward(rewardKey);

  const { summary, schedule } = useMemo(
    () =>
      calcLoan(
        Number(amount) || 0,
        Number(apr) || 0,
        years,
        Number(income) || 0
      ),
    [amount, apr, years, income]
  );

  const principalPct = summary.totalPaid
    ? (Number(amount) / summary.totalPaid) * 100
    : 50;
  const interestPct = 100 - principalPct;

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title="Loan Calculator"
        coins={coins}
        showBack
        gradient={['#16a34a', '#15803d']}
      />

      <ScrollView
        className="flex-1"
        style={rtlRootDirection(rtl)}
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#22c55e', '#16a34a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 24 }}
        >
          <Text className="text-white/80 text-sm mb-1" style={ta}>
            Monthly Installment
          </Text>
          <Text className="text-white text-4xl font-bold mb-2" style={ta}>
            EGP {formatNumber(Math.round(summary.monthlyPayment))}
          </Text>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
            <DollarSign size={16} color={colors.white} />
            <Text className="text-white/90 text-sm" style={ta}>
              For {years} years
            </Text>
          </View>
        </LinearGradient>

        <Card>
          <Text className="text-sm text-gray-700 font-medium mb-2" style={ta}>
            Loan Amount (EGP)
          </Text>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 12 })}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5 text-gray-800"
              style={ta}
            />
            <Text className="text-sm text-gray-600" style={ta}>
              EGP
            </Text>
          </View>
          <View style={rtlRowMerge(rtl, { flexWrap: 'wrap', gap: 8 })}>
            {AMOUNT_PRESETS.map((n) => (
              <Pressable
                key={n}
                onPress={() => setAmount(String(n))}
                className={`px-3 py-1.5 rounded-lg border ${
                  Number(amount) === n
                    ? 'bg-green-600 border-green-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    Number(amount) === n ? 'text-white' : 'text-gray-700'
                  }`}
                  style={ta}
                >
                  {n >= 1000 ? `${n / 1000}K` : n}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-sm text-gray-700 font-medium mb-2" style={ta}>
            Interest Rate (%)
          </Text>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 12 })}>
            <TextInput
              value={apr}
              onChangeText={setApr}
              keyboardType="decimal-pad"
              className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5 text-gray-800"
              style={ta}
            />
            <Text className="text-sm text-gray-600" style={ta}>
              %
            </Text>
          </View>
          <View style={rtlRowMerge(rtl, { flexWrap: 'wrap', gap: 8 })}>
            {APR_PRESETS.map((n) => (
              <Pressable
                key={n}
                onPress={() => setApr(String(n))}
                className={`px-3 py-1.5 rounded-lg border ${
                  Number(apr) === n
                    ? 'bg-green-600 border-green-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    Number(apr) === n ? 'text-white' : 'text-gray-700'
                  }`}
                  style={ta}
                >
                  {n}%
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-sm text-gray-700 font-medium mb-3" style={ta}>
            Loan Term
          </Text>
          <View style={rtlRowMerge(rtl, { gap: 8 })}>
            {TERM_OPTIONS.map((y) => (
              <Pressable
                key={y}
                onPress={() => setYears(y)}
                className={`flex-1 py-2.5 rounded-lg border items-center ${
                  years === y
                    ? 'bg-green-600 border-green-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    years === y ? 'text-white' : 'text-gray-700'
                  }`}
                  style={ta}
                >
                  {y} {y === 1 ? 'yr' : 'yrs'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-sm text-gray-700 font-medium mb-2" style={ta}>
            Monthly Income (EGP)
          </Text>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
            <TextInput
              value={income}
              onChangeText={setIncome}
              keyboardType="number-pad"
              className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5 text-gray-800"
              style={ta}
            />
            <Text className="text-sm text-gray-600" style={ta}>
              EGP
            </Text>
          </View>
        </Card>

        <Card>
          <Text className="text-gray-800 font-semibold mb-3" style={ta}>
            Payment Breakdown
          </Text>
          <View className="gap-2 mb-3">
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
              <Text className="text-sm text-gray-600" style={ta}>
                Total Amount Paid
              </Text>
              <Text className="text-sm text-gray-800 font-medium" style={ta}>
                EGP {formatNumber(Math.round(summary.totalPaid))}
              </Text>
            </View>
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
              <Text className="text-sm text-gray-600" style={ta}>
                Total Interest
              </Text>
              <Text className="text-sm text-orange-600 font-medium" style={ta}>
                EGP {formatNumber(Math.round(summary.totalInterest))}
              </Text>
            </View>
            <View
              style={rtlRowMerge(rtl, {
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: '#f3f4f6',
              })}
            >
              <Text className="text-sm text-gray-600" style={ta}>
                Principal Amount
              </Text>
              <Text className="text-sm text-gray-800 font-medium" style={ta}>
                EGP {formatNumber(Number(amount) || 0)}
              </Text>
            </View>
          </View>

          <View style={rtlRowMerge(rtl, { height: 32, borderRadius: 8, overflow: 'hidden', marginTop: 4 })}>
            <View
              style={{ width: `${principalPct}%`, backgroundColor: '#22c55e' }}
              className="items-center justify-center"
            >
              <Text className="text-xs text-white font-semibold" style={ta}>
                {Math.round(principalPct)}%
              </Text>
            </View>
            <View
              style={{ width: `${interestPct}%`, backgroundColor: '#f97316' }}
              className="items-center justify-center"
            >
              <Text className="text-xs text-white font-semibold" style={ta}>
                {Math.round(interestPct)}%
              </Text>
            </View>
          </View>
          <View style={rtlRowMerge(rtl, { justifyContent: 'space-between', marginTop: 8 })}>
            <Text className="text-xs text-gray-600" style={ta}>
              Principal
            </Text>
            <Text className="text-xs text-gray-600" style={ta}>
              Interest
            </Text>
          </View>
        </Card>

        <Card>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 })}>
            <Text className="text-gray-800 font-semibold" style={ta}>
              Amortization Schedule
            </Text>
            <Pressable onPress={() => setShowSchedule((v) => !v)}>
              <Text className="text-primary-700 font-semibold text-sm" style={ta}>
                {showSchedule ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>
          <Text className="text-xs text-gray-500 mb-3" style={ta}>
            Monthly breakdown of how much goes to interest vs principal.
          </Text>

          {showSchedule && (
            <View className="gap-2">
              <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
                <Text className="text-[11px] text-gray-500 w-[18%]" style={ta}>
                  Month
                </Text>
                <Text
                  className="text-[11px] text-gray-500 w-[26%] text-right"
                  style={ta}
                >
                  Payment
                </Text>
                <Text
                  className="text-[11px] text-gray-500 w-[26%] text-right"
                  style={ta}
                >
                  Interest
                </Text>
                <Text
                  className="text-[11px] text-gray-500 w-[30%] text-right"
                  style={ta}
                >
                  Balance
                </Text>
              </View>
              <View className="h-px bg-gray-200" />
              {schedule.slice(0, 12).map((r) => (
                <View key={r.month} style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
                  <Text className="text-[11px] text-gray-700 w-[18%]" style={ta}>
                    {r.month}
                  </Text>
                  <Text className="text-[11px] text-gray-700 w-[26%] text-right" style={ta}>
                    {formatNumber(Math.round(r.payment))}
                  </Text>
                  <Text className="text-[11px] text-orange-700 w-[26%] text-right" style={ta}>
                    {formatNumber(Math.round(r.interest))}
                  </Text>
                  <Text className="text-[11px] text-gray-700 w-[30%] text-right" style={ta}>
                    {formatNumber(Math.round(r.balance))}
                  </Text>
                </View>
              ))}
              {schedule.length > 12 && (
                <Text className="text-xs text-gray-500 mt-2" style={ta}>
                  Showing first 12 months only.
                </Text>
              )}
            </View>
          )}

          <View className="mt-4">
            <Button
              variant="primary"
              fullWidth
              disabled={rewarded}
              onPress={() => {
                void (async () => {
                  const reward = rewardFor('lesson_complete');
                  const ok = await claimRewardOnce(
                    rewardKey,
                    Math.round(reward.coins / 2),
                    Math.round(reward.xp / 2),
                    'lesson_complete'
                  );
                  if (!ok) {
                    Alert.alert(
                      'Could not claim reward',
                      'Please sign in again and retry.',
                    );
                    return;
                  }
                  setRewardClaimed(true);
                })();
              }}
            >
              {rewarded ? 'Reward claimed' : 'Claim reward for learning'}
            </Button>
            <Text className="text-xs text-gray-500 mt-2 text-center" style={ta}>
              One-time reward for using the calculator.
            </Text>
          </View>
        </Card>

        <Card
          className={
            summary.isAffordable
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }
        >
          <View style={rtlRowMerge(rtl, { alignItems: 'flex-start', gap: 12 })}>
            {summary.isAffordable ? (
              <TrendingUp size={22} color="#16a34a" />
            ) : (
              <AlertTriangle size={22} color="#dc2626" />
            )}
            <View className="flex-1">
              <Text
                className={`font-semibold mb-1 ${
                  summary.isAffordable ? 'text-green-900' : 'text-red-900'
                }`}
                style={ta}
              >
                Affordability Check
              </Text>
              <Text
                className={`text-sm mb-2 ${
                  summary.isAffordable ? 'text-green-700' : 'text-red-700'
                }`}
                style={ta}
              >
                Payment is {summary.affordabilityRatio.toFixed(1)}% of monthly
                income
              </Text>
              <View className="bg-white/50 rounded-full h-2 mb-2 overflow-hidden">
                <View
                  style={{
                    width: `${Math.min(100, summary.affordabilityRatio)}%`,
                    height: '100%',
                    backgroundColor: summary.isAffordable
                      ? '#22c55e'
                      : '#ef4444',
                  }}
                />
              </View>
              <Text className="text-xs text-gray-700" style={ta}>
                {summary.isAffordable
                  ? '✓ Within the recommended 40% threshold'
                  : '⚠ Exceeds the recommended 40% threshold'}
              </Text>
            </View>
          </View>
        </Card>

        <Card className="bg-blue-50 border border-blue-200">
          <Text className="text-gray-800 font-semibold mb-2" style={ta}>
            💡 Loan Tips
          </Text>
          <View className="gap-1">
            <Text className="text-xs text-gray-700" style={ta}>
              • Keep payments below 40% of income for safety
            </Text>
            <Text className="text-xs text-gray-700" style={ta}>
              • Shorter terms mean less total interest
            </Text>
            <Text className="text-xs text-gray-700" style={ta}>
              • Compare rates from multiple lenders
            </Text>
            <Text className="text-xs text-gray-700" style={ta}>
              • Extra payments reduce overall interest
            </Text>
          </View>
        </Card>

        <View style={rtlRowMerge(rtl, { gap: 8 })}>
          <View className="flex-1">
            <Button
              variant="outline"
              fullWidth
              onPress={() => router.push('/marketplace/credit-cards')}
            >
              Compare Offers
            </Button>
          </View>
          <View className="flex-1">
            <Button fullWidth onPress={() => router.push('/marketplace-home')}>
              Find Best Rates
            </Button>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
