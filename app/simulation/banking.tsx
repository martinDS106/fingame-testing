import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
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

import { LocaleChevron } from '@/components/LocaleChevron';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TxnActionModal, type TxnAction } from '@/components/banking/TxnActionModal';
import { colors } from '@/theme';
import { formatEGP, formatNumber } from '@/lib/format';
import { metaFor } from '@/lib/txnMeta';
import { localizedTxnNote, localizedTxnSubtitle } from '@/lib/txnNoteLocale';
import {
  localeBannerAlignStyle,
  localeIconRowStyle,
  localeTextBesideIconStyle,
  localeTrailingGroupRowStyle,
  mergeScrollContentRtl,
  rtlRootDirection,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { useBankingStore, useUserStore } from '@/stores';

interface QuickAction {
  key: TxnAction;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  bg: string;
  color: string;
}

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
  const { t, rtl, locale } = useT();
  const ta = rtlTextStyle(rtl);

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        key: 'deposit',
        label: t('banking.action.deposit'),
        Icon: ArrowDownCircle,
        bg: '#dcfce7',
        color: '#16a34a',
      },
      {
        key: 'withdraw',
        label: t('banking.action.withdraw'),
        Icon: ArrowUpCircle,
        bg: '#fee2e2',
        color: '#dc2626',
      },
      {
        key: 'pay_bill',
        label: t('banking.action.payBill'),
        Icon: Receipt,
        bg: '#fef9c3',
        color: colors.accent[600],
      },
      {
        key: 'transfer',
        label: t('banking.action.transfer'),
        Icon: Repeat,
        bg: colors.primary[100],
        color: colors.primary[600],
      },
    ],
    [t]
  );

  const accounts = useBankingStore((s) => s.accounts);
  const transactions = useBankingStore((s) => s.transactions);
  const totalBalance = useBankingStore((s) => s.totalBalance());
  const coins = useUserStore((s) => s.coins);

  const wallet = accounts.find((a) => a.type === 'checking')?.balance ?? 0;
  const savings = accounts.find((a) => a.type === 'savings')?.balance ?? 0;
  const health = computeHealthScore(totalBalance, savings, transactions.length);
  const recent = transactions.slice(0, 4);

  const healthTip =
    health >= 80
      ? t('banking.healthExcellent')
      : health >= 60
        ? t('banking.healthGood')
        : t('banking.healthStart');

  const dateLocale = locale === 'ar' ? 'ar-EG' : 'en-GB';

  const [modalAction, setModalAction] = useState<TxnAction | null>(null);

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('banking.screenTitle')}
        showBack
        showBell={false}
        rightSlot={
          <View
            className="items-center gap-1.5 bg-accent-400 px-3 py-1 rounded-full"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Star
              size={14}
              color={colors.primary[900]}
              fill={colors.primary[900]}
            />
            <Text className="text-primary-900 text-sm font-semibold" style={ta}>
              {formatNumber(coins)}
            </Text>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 40, gap: 16 })}
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
          <Text className="text-primary-100 text-sm mb-1" style={ta}>
            {t('banking.totalBalance')}
          </Text>
          <Text className="text-4xl text-white font-bold mb-4" style={ta}>
            {formatEGP(totalBalance)}
          </Text>

          <View style={[localeIconRowStyle(rtl), { gap: 12 }]}>
            <View
              className="flex-1 rounded-lg p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-xs text-primary-100" style={ta}>
                {t('banking.wallet')}
              </Text>
              <Text className="text-lg text-white font-semibold" style={ta}>
                {formatEGP(wallet)}
              </Text>
            </View>
            <View
              className="flex-1 rounded-lg p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-xs text-primary-100" style={ta}>
                {t('banking.savings')}
              </Text>
              <Text className="text-lg text-white font-semibold" style={ta}>
                {formatEGP(savings)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[localeIconRowStyle(rtl), { flexWrap: 'wrap' }]} className="-m-1.5">
          {quickActions.map(({ key, label, Icon, bg, color }) => (
            <View key={key} style={{ width: '50%' }} className="p-1.5">
              <PressableCard onPress={() => setModalAction(key)}>
                <View
                  style={[
                    localeIconRowStyle(rtl),
                    { alignItems: 'center', justifyContent: 'space-between' },
                  ]}
                >
                  <Text
                    style={[ta, { flex: 1, alignSelf: 'stretch' }]}
                    className="text-sm text-gray-800 font-medium"
                  >
                    {label}
                  </Text>
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon size={22} color={color} />
                  </View>
                </View>
              </PressableCard>
            </View>
          ))}
        </View>

        <PressableCard
          onPress={() => router.push('/simulation/savings-goal' as never)}
        >
          <View
            style={[
              localeIconRowStyle(rtl),
              { alignItems: 'center', gap: 12, justifyContent: 'space-between' },
            ]}
          >
            {rtl ? (
              <LocaleChevron rtl={rtl} size={24} color="#7c3aed" />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f3e8ff',
                  flexShrink: 0,
                }}
              >
                <Target size={22} color="#9333ea" />
              </View>
            )}
            <View style={[localeTextBesideIconStyle(rtl), { flex: 1, minWidth: 0 }]}>
              <Text
                style={[ta, { alignSelf: 'stretch' }]}
                className="text-gray-800 font-semibold"
              >
                {t('banking.savingsGoals')}
              </Text>
              <Text
                style={[ta, { alignSelf: 'stretch' }]}
                className="text-sm text-gray-600"
              >
                {t('banking.savingsGoalsDesc')}
              </Text>
            </View>
            {rtl ? (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f3e8ff',
                  flexShrink: 0,
                }}
              >
                <Target size={22} color="#9333ea" />
              </View>
            ) : (
              <LocaleChevron rtl={rtl} size={24} color="#7c3aed" />
            )}
          </View>
        </PressableCard>

        <Card>
          <View
            style={[
              localeIconRowStyle(rtl),
              { alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
            ]}
          >
            <TrendingUp size={20} color="#16a34a" />
            <Text
              style={[ta, { alignSelf: 'stretch', flex: 1, textAlign: rtl ? 'right' : 'left' }]}
              className="text-gray-800 font-semibold"
            >
              {t('banking.healthScore')}
            </Text>
          </View>
          <View
            style={[
              localeIconRowStyle(rtl),
              { alignItems: 'flex-end', gap: 8, marginBottom: 8, justifyContent: 'flex-end' },
            ]}
          >
            <Text className="text-sm text-gray-600 mb-1" style={ta}>
              / 100
            </Text>
            <Text className="text-4xl text-primary-600 font-bold" style={ta}>
              {health}
            </Text>
          </View>
          <ProgressBar
            value={health}
            height={8}
            gradient={['#4ade80', '#16a34a']}
          />
          <Text style={[ta, { alignSelf: 'stretch' }]} className="text-sm text-gray-600 mt-3">
            {healthTip}
          </Text>
        </Card>

        <Card>
          <View style={[localeBannerAlignStyle(rtl), { marginBottom: 12 }]}>
            <Text style={ta} className="text-gray-800 font-semibold">
              {t('banking.recentActivity')}
            </Text>
          </View>
          {recent.length === 0 ? (
            <View className="items-center py-6 gap-2">
              <Text className="text-4xl">💤</Text>
              <Text style={[ta, { textAlign: 'center' }]} className="text-sm text-gray-500">
                {t('banking.noTransactions')}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {recent.map((tx) => {
                const meta = metaFor(tx.category, locale);
                const isPositive = tx.type === 'deposit';
                const sign = isPositive ? '+' : '-';
                const title =
                  localizedTxnNote(tx.note, locale) ?? meta.label;
                const subtitle = localizedTxnSubtitle(tx.category, locale);
                const amountEl = (
                  <Text
                    className={`text-sm font-semibold shrink-0 ${
                      isPositive ? 'text-green-600' : 'text-gray-800'
                    }`}
                    style={ta}
                  >
                    {sign}
                    {formatEGP(tx.amount, locale)}
                  </Text>
                );
                const textBlock = (
                  <View style={localeTextBesideIconStyle(rtl)}>
                    <Text
                      style={ta}
                      className="text-sm text-gray-800 font-medium"
                    >
                      {title}
                    </Text>
                    <Text style={ta} className="text-xs text-gray-500">
                      {subtitle} •{' '}
                      {new Date(tx.at).toLocaleDateString(dateLocale)}
                    </Text>
                  </View>
                );
                const iconEl = (
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center shrink-0"
                    style={{ backgroundColor: colors.gray[100] }}
                  >
                    <Text className="text-xl">{meta.emoji}</Text>
                  </View>
                );
                return (
                  <View
                    key={tx.id}
                    className="pb-3 border-b border-gray-100 last:border-b-0"
                    style={[localeIconRowStyle(rtl), { alignItems: 'center', gap: 12 }]}
                  >
                    <>
                      {iconEl}
                      {textBlock}
                      {amountEl}
                    </>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <Pressable
          onPress={() => router.push('/challenges' as never)}
          className="active:opacity-90"
        >
          <LinearGradient
            colors={[colors.accent[400], colors.accent[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, padding: 16 }}
          >
            <View style={localeTrailingGroupRowStyle(rtl)}>
              <Button
                variant="secondary"
                size="sm"
                onPress={() => router.push('/challenges' as never)}
              >
                {t('banking.scenarioStart')}
              </Button>
              <View style={localeTextBesideIconStyle(rtl)}>
                <Text
                  style={[ta, { alignSelf: 'stretch' }]}
                  className="text-primary-900 font-semibold mb-1"
                >
                  {t('banking.scenarioTitle')}
                </Text>
                <Text
                  style={[ta, { alignSelf: 'stretch' }]}
                  className="text-sm text-primary-800"
                >
                  {t('banking.scenarioDesc')}
                </Text>
              </View>
              <Text className="text-3xl">🎯</Text>
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
