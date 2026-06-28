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
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { formatEGP } from '@/lib/format';
import {
  getLocalizedBusinessStepConfig,
  localizeStepDescription,
  localizeStepTitle,
} from '@/lib/businessLocale';
import type { BusinessStepOption } from '@/lib/businessSteps';
import { rewardFor } from '@/lib/rewards';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { notifyError, notifySuccess } from '@/lib/celebration';
import {
  CORP_TAX_RATE,
  VAT_RATE,
  useBusinessStore,
  useUserStore,
  type BusinessStepId,
} from '@/stores';

export default function BusinessSimulationScreen() {
  const { t, locale, rtl } = useT();
  const ta = rtlTextStyle(rtl);
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

  const currentConfig = useMemo(
    () => getLocalizedBusinessStepConfig(currentStep, locale),
    [currentStep, locale]
  );
  const currentStepInfo = steps.find((s) => s.id === currentStep);
  const allComplete = useMemo(
    () => steps.every((s) => s.completed),
    [steps]
  );

  const handlePick = (option: BusinessStepOption) => {
    if (!currentStepInfo || currentStepInfo.completed) return;
    Alert.alert(
      currentConfig.question,
      `${option.label}\n\n${t('business.cashImpact')} ${formatEGP(
        option.impactOnCash
      )}\n${t('business.repImpact')} ${option.impactOnReputation >= 0 ? '+' : ''}${
        option.impactOnReputation
      }`,
      [
        { text: t('action.cancel'), style: 'cancel' },
        {
          text: t('action.confirm'),
          onPress: () => {
            void (async () => {
              makeDecision(
                currentStep,
                option.id,
                option.impactOnCash,
                option.impactOnReputation
              );
              completeStep(currentStep);

              const reward = rewardFor('lesson_complete');
              const okCoins = await addCoins(reward.coins, 'lesson_complete');
              if (!okCoins) {
                notifyError(
                  t('sim.couldNotSaveReward'),
                  t('sim.coinsNotSynced'),
                );
                return;
              }
              const okXp = await addXP(reward.xp);
              if (!okXp) {
                await useUserStore
                  .getState()
                  .spendCoins(reward.coins, 'lesson_complete');
                notifyError(t('sim.couldNotSaveXp'), t('sim.xpNotSynced'));
              }
            })();
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(t('business.restartTitle'), t('business.restartBody'), [
        { text: t('action.cancel'), style: 'cancel' },
        {
          text: t('business.restart'),
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
    void (async () => {
      const coinDelta = Math.round(reward.coins / 4);
      const ok = await addCoins(coinDelta, 'simulation_win');
      if (!ok) {
        notifyError(t('sim.couldNotSaveReward'), t('sim.coinsNotSynced'));
      }
    })();

    notifySuccess(
      t('business.monthClosed', { n: report.month }),
      `${t('business.revenue')} ${formatEGP(report.revenue)}\n` +
        `${t('business.expenses')} ${formatEGP(report.expenses)}\n` +
        `${t('business.grossProfit')} ${formatEGP(report.grossProfit)}\n\n` +
        `${t('business.vatLine')} ${formatEGP(report.vatCollected)}\n` +
        `${t('business.corpLine')} ${formatEGP(report.corporateTax)}\n\n` +
        `${t('business.netProfit')} ${formatEGP(report.netProfit)}`,
    );
  };

  const handlePayTaxes = () => {
    const due = vatPayable + corpTaxPayable;
    if (due <= 0) {
      notifySuccess(t('business.noTaxes'), t('business.caughtUp'));
      return;
    }
    Alert.alert(
      t('business.payTaxesQ'),
      `${t('business.vatOwedLine')} ${formatEGP(vatPayable)}\n${t('business.corpOwedLine')} ${formatEGP(
        corpTaxPayable
      )}\n\n${t('business.total')} ${formatEGP(due)}`,
      [
        { text: t('action.cancel'), style: 'cancel' },
        {
          text: t('business.payNow'),
          onPress: () => {
            const res = payTaxes();
            if (!res.ok) {
              notifyError(t('business.notEnoughCash'), res.reason ?? '');
              return;
            }
            void (async () => {
              const ok = await addCoins(20, 'simulation_win');
              if (!ok) {
                notifyError(t('sim.couldNotSaveReward'), t('sim.coinsNotSynced'));
                return;
              }
              notifySuccess(
                t('business.taxesPaid'),
                t('business.taxesPaidBody', { amount: formatEGP(res.paid) }),
              );
            })();
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
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('business.screenTitle')}
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
        style={rtlRootDirection(rtl)}
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 40, gap: 16 })}
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
          <Text className="text-purple-100 text-sm mb-1" style={ta}>
            {t('business.companyCash')}
          </Text>
          <Text className="text-4xl text-white font-bold mb-4" style={ta}>
            {cash >= 0 ? formatEGP(cash) : `- ${formatEGP(Math.abs(cash))}`}
          </Text>
          <View style={rtlRowMerge(rtl, { gap: 12 })}>
            <View
              className="flex-1 rounded-lg p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-xs text-purple-100" style={ta}>
                {t('business.reputation')}
              </Text>
              <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 4 })}>
                <Text className="text-lg text-white font-semibold" style={ta}>
                  {reputation}
                </Text>
                <Text className="text-xs text-purple-100" style={ta}>
                  {t('business.repOf')}
                </Text>
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
              <Text className="text-xs text-purple-100" style={ta}>
                {t('business.progress')}
              </Text>
              <Text className="text-lg text-white font-semibold" style={ta}>
                {progressPct.toFixed(0)}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Card>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 })}>
            <Text className="text-gray-800 font-semibold" style={ta}>
              {t('business.journey')}
            </Text>
            <Text className="text-xs text-gray-500" style={ta}>
              {t('business.stepsCount', {
                done: steps.filter((s) => s.completed).length,
                total: steps.length,
              })}
            </Text>
          </View>
          <ProgressBar
            value={progressPct}
            height={8}
            gradient={['#a855f7', '#7e22ce']}
          />
          <Text className="text-xs text-gray-500 mt-2" style={ta}>
            {t('business.reputationLabel')}{' '}
            <Text style={{ color: reputationColor, fontWeight: '600' }}>
              {reputation >= 70
                ? t('business.repStrong')
                : reputation >= 40
                  ? t('business.repDecent')
                  : t('business.repStruggling')}
            </Text>
          </Text>
        </Card>

        <Card>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 })}>
            <Text className="text-gray-800 font-semibold" style={ta}>
              {t('business.plMonth', { n: monthsRunning })}
            </Text>
            <Text className="text-xs text-gray-500" style={ta}>
              {t('business.taxRates', {
                vat: (VAT_RATE * 100).toFixed(0),
                corp: (CORP_TAX_RATE * 100).toFixed(1),
              })}
            </Text>
          </View>

          <View className="gap-1">
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
              <Text className="text-sm text-gray-600" style={ta}>
                {t('business.totalRevenue')}
              </Text>
              <Text className="text-sm text-gray-900 font-semibold" style={ta}>
                {formatEGP(revenue)}
              </Text>
            </View>
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
              <Text className="text-sm text-gray-600" style={ta}>
                {t('business.totalExpenses')}
              </Text>
              <Text className="text-sm text-gray-900 font-semibold" style={ta}>
                - {formatEGP(expenses)}
              </Text>
            </View>
            <View className="h-px bg-gray-200 my-1" />
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
              <Text className="text-sm text-gray-700 font-medium" style={ta}>
                {t('business.grossProfit')}
              </Text>
              <Text
                className={
                  grossProfit >= 0
                    ? 'text-sm text-green-700 font-semibold'
                    : 'text-sm text-red-700 font-semibold'
                }
                style={ta}
              >
                {formatEGP(grossProfit)}
              </Text>
            </View>
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
              <Text className="text-sm text-gray-600" style={ta}>
                {t('business.vatOwed')}
              </Text>
              <Text className="text-sm text-amber-700 font-semibold" style={ta}>
                - {formatEGP(vatPayable)}
              </Text>
            </View>
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
              <Text className="text-sm text-gray-600" style={ta}>
                {t('business.corpTaxOwed')}
              </Text>
              <Text className="text-sm text-amber-700 font-semibold" style={ta}>
                - {formatEGP(corpTaxPayable)}
              </Text>
            </View>
            <View className="h-px bg-gray-200 my-1" />
            <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
              <Text className="text-base text-gray-900 font-bold" style={ta}>
                {t('business.netProfit')}
              </Text>
              <Text
                className={
                  netProfit >= 0
                    ? 'text-base text-green-700 font-bold'
                    : 'text-base text-red-700 font-bold'
                }
                style={ta}
              >
                {formatEGP(netProfit)}
              </Text>
            </View>
          </View>

          <View style={rtlRowMerge(rtl, { gap: 8, marginTop: 16 })}>
            <View className="flex-1">
              <Button variant="outline" fullWidth onPress={handleRunMonth}>
                {t('business.runMonth')}
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="primary"
                fullWidth
                onPress={handlePayTaxes}
                disabled={vatPayable + corpTaxPayable <= 0}
              >
                {t('business.payTaxes')}
              </Button>
            </View>
          </View>

          {reports.length > 0 && (
            <View className="mt-4">
              <Text className="text-xs text-gray-500 mb-2" style={ta}>
                {t('business.lastMonths', {
                  n: Math.min(3, reports.length),
                })}
              </Text>
              <View className="gap-2">
                {reports.slice(0, 3).map((r) => (
                  <View
                    key={r.id}
                    style={rtlRowMerge(rtl, {
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f9fafb',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    })}
                  >
                    <Text className="text-xs text-gray-600" style={ta}>
                      {t('business.monthN', { n: r.month })}
                    </Text>
                    <Text className="text-xs text-gray-500" style={ta}>
                      {t('business.rev', { amount: formatEGP(r.revenue) })}
                    </Text>
                    <Text
                      className={
                        r.netProfit >= 0
                          ? 'text-xs text-green-700 font-semibold'
                          : 'text-xs text-red-700 font-semibold'
                      }
                      style={ta}
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
            <Text className="text-xl text-gray-900 font-bold mb-1" style={ta}>
              {t('business.allDone')}
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-4" style={ta}>
              {t('business.allDoneBody', {
                cash: formatEGP(cash),
                rep: String(reputation),
              })}
            </Text>
            <Button variant="primary" onPress={handleReset}>
              {t('business.startNew')}
            </Button>
          </Card>
        ) : (
          <Card>
            <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12, marginBottom: 12 })}>
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: '#f3e8ff' }}
              >
                <Text className="text-2xl">{currentConfig.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-purple-600 font-semibold uppercase" style={ta}>
                  {t('business.currentStep')}
                </Text>
                <Text className="text-base text-gray-900 font-semibold" style={ta}>
                  {currentStepInfo
                    ? localizeStepTitle(
                        currentStepInfo.id as BusinessStepId,
                        currentStepInfo.title,
                        locale
                      )
                    : ''}
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-700 font-medium mb-3" style={ta}>
              {currentConfig.question}
            </Text>

            <View className="gap-2">
              {currentConfig.options.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => handlePick(opt)}
                  className="border border-gray-200 rounded-xl p-3 active:bg-gray-50"
                >
                  <Text className="text-sm text-gray-900 font-semibold mb-0.5" style={ta}>
                    {opt.label}
                  </Text>
                  <Text className="text-xs text-gray-500 mb-2" style={ta}>
                    {opt.description}
                  </Text>
                  <View style={rtlRowMerge(rtl, { gap: 8 })}>
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
                        style={ta}
                      >
                        {opt.impactOnCash >= 0 ? '+' : ''}
                        {formatEGP(opt.impactOnCash)}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-0.5 rounded-md"
                      style={rtlRowMerge(rtl, {
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor:
                          opt.impactOnReputation >= 0 ? '#dbeafe' : '#fef3c7',
                      })}
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
                        style={ta}
                      >
                        {opt.impactOnReputation >= 0 ? '+' : ''}
                        {t('business.repBadge', {
                          n: `${opt.impactOnReputation >= 0 ? '+' : ''}${opt.impactOnReputation}`,
                        })}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>
        )}

        <View>
          <Text className="text-lg text-gray-800 font-semibold mb-3" style={ta}>
            {t('business.allSteps')}
          </Text>
          <View className="gap-2">
            {steps.map((step, idx) => {
              const cfg = getLocalizedBusinessStepConfig(
                step.id as BusinessStepId,
                locale
              );
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
                  <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12 })}>
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
                        style={ta}
                      >
                        {t('business.stepNumber', {
                          title: localizeStepTitle(
                            step.id as BusinessStepId,
                            step.title,
                            locale
                          ),
                          n: idx + 1,
                        })}
                      </Text>
                      <Text
                        className={
                          step.unlocked
                            ? 'text-xs text-gray-500'
                            : 'text-xs text-gray-400'
                        }
                        style={ta}
                      >
                        {localizeStepDescription(
                          step.id as BusinessStepId,
                          step.description,
                          locale
                        )}
                      </Text>
                    </View>
                    {isCurrent && (
                      <View className="bg-purple-100 px-2 py-1 rounded-full">
                        <Text className="text-[10px] text-purple-700 font-bold" style={ta}>
                          {t('business.now')}
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
