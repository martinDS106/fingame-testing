import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle2,
  Lock,
  RefreshCw,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { formatEGP } from '@/lib/format';
import {
  BUSINESS_STEP_CONFIGS,
  type BusinessStepOption,
} from '@/lib/businessSteps';
import { rewardFor } from '@/lib/rewards';
import {
  CORP_TAX_RATE,
  VAT_RATE,
  useBusinessStore,
  useUserStore,
  type BusinessStepId,
} from '@/stores';

export default function BusinessSimulationScreen() {
  const currentStep = useBusinessStore((s) => s.currentStep);
  const steps = useBusinessStore((s) => s.steps);
  const cash = useBusinessStore((s) => s.cash);
  const reputation = useBusinessStore((s) => s.reputation);
  const progressPct = useBusinessStore((s) => s.progressPct());
  const monthsRunning = useBusinessStore((s) => s.monthsRunning);
  const revenue = useBusinessStore((s) => s.revenue);
  const expenses = useBusinessStore((s) => s.expenses);
  const vatPayable = useBusinessStore((s) => s.vatPayable);
  const corpTaxPayable = useBusinessStore((s) => s.corpTaxPayable);
  const grossProfit = useBusinessStore((s) => s.grossProfit());
  const netProfit = useBusinessStore((s) => s.netProfit());
  const reports = useBusinessStore((s) => s.reports);
  const makeDecision = useBusinessStore((s) => s.makeDecision);
  const completeStep = useBusinessStore((s) => s.completeStep);
  const runMonth = useBusinessStore((s) => s.runMonth);
  const payTaxes = useBusinessStore((s) => s.payTaxes);
  const resetBusiness = useBusinessStore((s) => s.reset);
  const addCoins = useUserStore((s) => s.addCoins);
  const addXP = useUserStore((s) => s.addXP);

  const currentConfig = BUSINESS_STEP_CONFIGS[currentStep];
  const currentStepInfo = steps.find((s) => s.id === currentStep);
  const allComplete = useMemo(
    () => steps.every((s) => s.completed),
    [steps]
  );

  const handlePick = (option: BusinessStepOption) => {
    if (!currentStepInfo || currentStepInfo.completed) return;
    Alert.alert(
      currentConfig.question,
      `${option.label}\n\nCash impact: ${formatEGP(
        option.impactOnCash
      )}\nReputation: ${option.impactOnReputation >= 0 ? '+' : ''}${
        option.impactOnReputation
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            makeDecision(
              currentStep,
              option.id,
              option.impactOnCash,
              option.impactOnReputation
            );
            completeStep(currentStep);

            const reward = rewardFor('lesson_complete');
            addCoins(reward.coins, 'lesson_complete');
            addXP(reward.xp);
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Restart business?',
      'This will clear your current progress and reset cash to EGP 25,000.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: () => resetBusiness(),
        },
      ]
    );
  };

  const handleRunMonth = () => {
    // Revenue grows with completed steps (scale) + reputation boost.
    const completedSteps = steps.filter((s) => s.completed).length;
    const baseRevenue = 3000 + completedSteps * 1500;
    const reputationMultiplier = 0.6 + reputation / 100;
    const randomizer = 0.8 + Math.random() * 0.5; // 0.8x .. 1.3x
    const monthlyRevenue = Math.round(
      baseRevenue * reputationMultiplier * randomizer
    );
    const monthlyExpenses = Math.round(
      monthlyRevenue * (0.55 + Math.random() * 0.15)
    );

    const report = runMonth(monthlyRevenue, monthlyExpenses);
    const reward = rewardFor('simulation_win');
    addCoins(Math.round(reward.coins / 4), 'simulation_win');

    Alert.alert(
      `Month ${report.month} Closed`,
      `Revenue: ${formatEGP(report.revenue)}\n` +
        `Expenses: ${formatEGP(report.expenses)}\n` +
        `Gross Profit: ${formatEGP(report.grossProfit)}\n\n` +
        `VAT (14%): ${formatEGP(report.vatCollected)}\n` +
        `Corp Tax (22.5%): ${formatEGP(report.corporateTax)}\n\n` +
        `Net Profit: ${formatEGP(report.netProfit)}`
    );
  };

  const handlePayTaxes = () => {
    const due = vatPayable + corpTaxPayable;
    if (due <= 0) {
      Alert.alert('No taxes due', 'You are all caught up!');
      return;
    }
    Alert.alert(
      'Pay taxes?',
      `VAT owed: ${formatEGP(vatPayable)}\nCorp Tax owed: ${formatEGP(
        corpTaxPayable
      )}\n\nTotal: ${formatEGP(due)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: () => {
            const res = payTaxes();
            if (!res.ok) {
              Alert.alert('Not enough cash', res.reason ?? '');
              return;
            }
            addCoins(20, 'simulation_win');
            Alert.alert('Taxes paid ✅', `Paid ${formatEGP(res.paid)}. +20 coins.`);
          },
        },
      ]
    );
  };

  const reputationColor =
    reputation >= 70
      ? '#16a34a'
      : reputation >= 40
        ? colors.accent[600]
        : '#dc2626';

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Business Simulation"
        showBack
        showBell={false}
        gradient={['#9333ea', '#7e22ce']}
        rightSlot={
          <Pressable
            onPress={handleReset}
            hitSlop={8}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <RefreshCw size={18} color={colors.white} />
          </Pressable>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#9333ea', '#7e22ce']}
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
          <Text className="text-purple-100 text-sm mb-1">Company Cash</Text>
          <Text className="text-4xl text-white font-bold mb-4">
            {cash >= 0 ? formatEGP(cash) : `- ${formatEGP(Math.abs(cash))}`}
          </Text>
          <View className="flex-row gap-3">
            <View
              className="flex-1 rounded-lg p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-xs text-purple-100">Reputation</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-lg text-white font-semibold">
                  {reputation}
                </Text>
                <Text className="text-xs text-purple-100">/100</Text>
                {reputation >= 60 ? (
                  <TrendingUp size={14} color={colors.white} />
                ) : (
                  <TrendingDown size={14} color={colors.white} />
                )}
              </View>
            </View>
            <View
              className="flex-1 rounded-lg p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-xs text-purple-100">Progress</Text>
              <Text className="text-lg text-white font-semibold">
                {progressPct.toFixed(0)}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-800 font-semibold">Journey</Text>
            <Text className="text-xs text-gray-500">
              {steps.filter((s) => s.completed).length} / {steps.length} steps
            </Text>
          </View>
          <ProgressBar
            value={progressPct}
            height={8}
            gradient={['#a855f7', '#7e22ce']}
          />
          <Text className="text-xs text-gray-500 mt-2">
            Reputation:{' '}
            <Text style={{ color: reputationColor, fontWeight: '600' }}>
              {reputation >= 70
                ? 'Strong'
                : reputation >= 40
                  ? 'Decent'
                  : 'Struggling'}
            </Text>
          </Text>
        </Card>

        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-800 font-semibold">
              P&L · Month {monthsRunning}
            </Text>
            <Text className="text-xs text-gray-500">
              VAT {(VAT_RATE * 100).toFixed(0)}% · Corp {(CORP_TAX_RATE * 100).toFixed(1)}%
            </Text>
          </View>

          <View className="gap-1">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Total Revenue</Text>
              <Text className="text-sm text-gray-900 font-semibold">
                {formatEGP(revenue)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Total Expenses</Text>
              <Text className="text-sm text-gray-900 font-semibold">
                - {formatEGP(expenses)}
              </Text>
            </View>
            <View className="h-px bg-gray-200 my-1" />
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-700 font-medium">
                Gross Profit
              </Text>
              <Text
                className={
                  grossProfit >= 0
                    ? 'text-sm text-green-700 font-semibold'
                    : 'text-sm text-red-700 font-semibold'
                }
              >
                {formatEGP(grossProfit)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">VAT Owed</Text>
              <Text className="text-sm text-amber-700 font-semibold">
                - {formatEGP(vatPayable)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Corporate Tax Owed</Text>
              <Text className="text-sm text-amber-700 font-semibold">
                - {formatEGP(corpTaxPayable)}
              </Text>
            </View>
            <View className="h-px bg-gray-200 my-1" />
            <View className="flex-row justify-between">
              <Text className="text-base text-gray-900 font-bold">
                Net Profit
              </Text>
              <Text
                className={
                  netProfit >= 0
                    ? 'text-base text-green-700 font-bold'
                    : 'text-base text-red-700 font-bold'
                }
              >
                {formatEGP(netProfit)}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2 mt-4">
            <View className="flex-1">
              <Button variant="outline" fullWidth onPress={handleRunMonth}>
                Run Month
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="primary"
                fullWidth
                onPress={handlePayTaxes}
                disabled={vatPayable + corpTaxPayable <= 0}
              >
                Pay Taxes
              </Button>
            </View>
          </View>

          {reports.length > 0 && (
            <View className="mt-4">
              <Text className="text-xs text-gray-500 mb-2">
                Last {Math.min(3, reports.length)} months
              </Text>
              <View className="gap-2">
                {reports.slice(0, 3).map((r) => (
                  <View
                    key={r.id}
                    className="flex-row items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <Text className="text-xs text-gray-600">
                      Month {r.month}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Rev {formatEGP(r.revenue)}
                    </Text>
                    <Text
                      className={
                        r.netProfit >= 0
                          ? 'text-xs text-green-700 font-semibold'
                          : 'text-xs text-red-700 font-semibold'
                      }
                    >
                      {r.netProfit >= 0 ? '+' : ''}
                      {formatEGP(r.netProfit)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        {allComplete ? (
          <Card className="items-center py-8">
            <Text className="text-6xl mb-3">🏆</Text>
            <Text className="text-xl text-gray-900 font-bold mb-1">
              You did it!
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-4">
              All 10 steps completed. Final cash: {formatEGP(cash)} · Reputation:{' '}
              {reputation}
            </Text>
            <Button variant="primary" onPress={handleReset}>
              Start New Business
            </Button>
          </Card>
        ) : (
          <Card>
            <View className="flex-row items-center gap-3 mb-3">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: '#f3e8ff' }}
              >
                <Text className="text-2xl">{currentConfig.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-purple-600 font-semibold uppercase">
                  Current Step
                </Text>
                <Text className="text-base text-gray-900 font-semibold">
                  {currentStepInfo?.title}
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-700 font-medium mb-3">
              {currentConfig.question}
            </Text>

            <View className="gap-2">
              {currentConfig.options.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => handlePick(opt)}
                  className="border border-gray-200 rounded-xl p-3 active:bg-gray-50"
                >
                  <Text className="text-sm text-gray-900 font-semibold mb-0.5">
                    {opt.label}
                  </Text>
                  <Text className="text-xs text-gray-500 mb-2">
                    {opt.description}
                  </Text>
                  <View className="flex-row gap-2">
                    <View
                      className="px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor:
                          opt.impactOnCash >= 0 ? '#dcfce7' : '#fee2e2',
                      }}
                    >
                      <Text
                        className={
                          opt.impactOnCash >= 0
                            ? 'text-[11px] font-semibold text-green-700'
                            : 'text-[11px] font-semibold text-red-700'
                        }
                      >
                        {opt.impactOnCash >= 0 ? '+' : ''}
                        {formatEGP(opt.impactOnCash)}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-0.5 rounded-md flex-row items-center gap-1"
                      style={{
                        backgroundColor:
                          opt.impactOnReputation >= 0 ? '#dbeafe' : '#fef3c7',
                      }}
                    >
                      <Star
                        size={10}
                        color={
                          opt.impactOnReputation >= 0 ? '#1d4ed8' : '#a16207'
                        }
                      />
                      <Text
                        className={
                          opt.impactOnReputation >= 0
                            ? 'text-[11px] font-semibold text-blue-700'
                            : 'text-[11px] font-semibold text-yellow-700'
                        }
                      >
                        {opt.impactOnReputation >= 0 ? '+' : ''}
                        {opt.impactOnReputation} rep
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>
        )}

        <View>
          <Text className="text-lg text-gray-800 font-semibold mb-3">
            All Steps
          </Text>
          <View className="gap-2">
            {steps.map((step, idx) => {
              const cfg = BUSINESS_STEP_CONFIGS[step.id as BusinessStepId];
              const isCurrent = step.id === currentStep && !step.completed;
              return (
                <Card
                  key={step.id}
                  className={
                    isCurrent
                      ? 'border-purple-300'
                      : step.completed
                        ? 'border-green-200'
                        : ''
                  }
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center"
                      style={{
                        backgroundColor: step.completed
                          ? '#dcfce7'
                          : step.unlocked
                            ? '#f3e8ff'
                            : colors.gray[100],
                      }}
                    >
                      {step.completed ? (
                        <CheckCircle2 size={20} color="#16a34a" />
                      ) : step.unlocked ? (
                        <Text className="text-lg">{cfg.emoji}</Text>
                      ) : (
                        <Lock size={18} color={colors.gray[400]} />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={
                          step.unlocked
                            ? 'text-sm text-gray-900 font-semibold'
                            : 'text-sm text-gray-400 font-medium'
                        }
                      >
                        {idx + 1}. {step.title}
                      </Text>
                      <Text
                        className={
                          step.unlocked
                            ? 'text-xs text-gray-500'
                            : 'text-xs text-gray-400'
                        }
                      >
                        {step.description}
                      </Text>
                    </View>
                    {isCurrent && (
                      <View className="bg-purple-100 px-2 py-1 rounded-full">
                        <Text className="text-[10px] text-purple-700 font-bold">
                          NOW
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
