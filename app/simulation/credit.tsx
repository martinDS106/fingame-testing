import { useMemo, useState } from 'react';
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
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard as CreditIcon,
  RefreshCw,
  TrendingUp,
  X,
} from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { formatEGP } from '@/lib/format';
import {
  creditActionDescription,
  creditActionLabel,
  creditActionLabelForAction,
  scoreCategoryLabel,
} from '@/lib/creditLocale';
import { rewardFor } from '@/lib/rewards';
import {
  localeIconRowStyle,
  localeTextBesideIconStyle,
  mergeScrollContentRtl,
  rtlRootDirection,
  rtlRowMerge,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import {
  CREDIT_ACTION_DEFINITIONS,
  useCreditStore,
  useUserStore,
  type CreditActionType,
  type CreditCard as CreditCardType,
} from '@/stores';

function cardDisplayName(
  cardId: string,
  t: (key: string) => string,
  fallback: string
): string {
  if (cardId === 'card-visa') return t('credit.card.visa');
  if (cardId === 'card-mc') return t('credit.card.mastercard');
  return fallback;
}

const SCORE_MIN = 300;
const SCORE_MAX = 850;

const QUICK_SCENARIOS: {
  key: CreditActionType;
  emoji: string;
  positive: boolean;
}[] = [
  { key: 'pay_on_time', emoji: '✅', positive: true },
  { key: 'pay_full_balance', emoji: '💯', positive: true },
  { key: 'bnpl_responsible', emoji: '🛍️', positive: true },
  { key: 'pay_late', emoji: '⏰', positive: false },
  { key: 'max_out_card', emoji: '💳', positive: false },
  { key: 'open_new_card', emoji: '🆕', positive: false },
  { key: 'close_old_card', emoji: '❌', positive: false },
  { key: 'bnpl_missed', emoji: '🚨', positive: false },
];

export default function CreditSimulationScreen() {
  const { t, locale, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const score = useCreditStore((s) => s.score);
  const cards = useCreditStore((s) => s.cards);
  const actions = useCreditStore((s) => s.actions);
  const utilization = useCreditStore((s) => s.utilization());
  const totalDebt = useCreditStore((s) => s.totalDebt());
  const totalLimit = useCreditStore((s) => s.totalLimit());
  const applyAction = useCreditStore((s) => s.applyAction);
  const resetScore = useCreditStore((s) => s.resetScore);
  const makePayment = useCreditStore((s) => s.makePayment);
  const addCoins = useUserStore((s) => s.addCoins);
  const addXP = useUserStore((s) => s.addXP);

  const [activeCard, setActiveCard] = useState<CreditCardType | null>(null);

  const category = useMemo(
    () => scoreCategoryLabel(score, locale),
    [score, locale]
  );
  const pct = ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;
  const radius = 80;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;

  const handleScenario = (type: CreditActionType) => {
    const result = applyAction(type);
    const label = creditActionLabel(type, locale);
    const desc = creditActionDescription(type, locale);

    void (async () => {
      if (result.delta > 0) {
        const reward = rewardFor('quiz_correct');
        const okCoins = await addCoins(reward.coins, 'quiz_correct');
        if (!okCoins) {
          Alert.alert(t('sim.couldNotSaveReward'), t('sim.scoreNotSynced'));
          return;
        }
        const okXp = await addXP(reward.xp);
        if (!okXp) {
          await useUserStore.getState().spendCoins(reward.coins, 'quiz_correct');
          Alert.alert(t('sim.couldNotSaveXp'), t('sim.xpNotSynced'));
          return;
        }
      }

      Alert.alert(
        label,
        `${t('credit.scoreDelta', {
          delta: `${result.delta >= 0 ? '+' : ''}${result.delta}`,
        })}\n\n${desc}`
      );
    })();
  };

  const handleReset = () => {
    Alert.alert(t('credit.resetTitle'), t('credit.resetBody'), [
      { text: t('action.cancel'), style: 'cancel' },
      {
        text: t('credit.reset'),
        style: 'destructive',
        onPress: () => resetScore(),
      },
    ]);
  };

  const factors = useMemo(
    () => [
      {
        name: t('credit.factor.paymentHistory'),
        score: Math.min(
          100,
          Math.max(40, 95 - actions.filter((a) => a.scoreImpact < 0).length * 5)
        ),
        weight: '35%',
      },
      {
        name: t('credit.factor.utilization'),
        score: Math.max(0, 100 - utilization),
        weight: '30%',
      },
      {
        name: t('credit.factor.mix'),
        score: cards.length >= 2 ? 75 : 50,
        weight: '15%',
      },
      { name: t('credit.factor.age'), score: 72, weight: '15%' },
      {
        name: t('credit.factor.newCredit'),
        score: Math.max(
          30,
          100 -
            actions.filter((a) => a.type === 'open_new_card').length * 15
        ),
        weight: '10%',
      },
    ],
    [t, actions, utilization, cards.length]
  );

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('credit.screenTitle')}
        showBack
        showBell={false}
        gradient={['#ea580c', '#c2410c']}
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
          colors={['#ea580c', '#c2410c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text className="text-orange-100 text-sm mb-4" style={ta}>
            {t('credit.yourScore')}
          </Text>

          <View
            style={{
              width: radius * 2 + stroke,
              height: radius * 2 + stroke,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg
              width={radius * 2 + stroke}
              height={radius * 2 + stroke}
              style={{ transform: [{ rotate: '-90deg' }] }}
            >
              <Defs>
                <SvgGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                  <Stop offset="1" stopColor="#fde68a" stopOpacity="1" />
                </SvgGradient>
              </Defs>
              <Circle
                cx={radius + stroke / 2}
                cy={radius + stroke / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={stroke}
              />
              <Circle
                cx={radius + stroke / 2}
                cy={radius + stroke / 2}
                r={radius}
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct / 100)}
                strokeLinecap="round"
              />
            </Svg>
            <View
              style={{ position: 'absolute', alignItems: 'center' }}
            >
              <Text className="text-6xl text-white font-bold" style={ta}>
                {score}
              </Text>
              <Text className="text-xs text-orange-100" style={ta}>
                {t('credit.outOf', { max: SCORE_MAX })}
              </Text>
            </View>
          </View>

          <View
            className="mt-4 px-4 py-1 rounded-full"
            style={{ backgroundColor: category.bg }}
          >
            <Text
              className="text-base font-semibold"
              style={[ta, { color: category.color }]}
            >
              {category.label}
            </Text>
          </View>
        </LinearGradient>

        <Card>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 })}>
            <Text className="text-gray-800 font-semibold" style={ta}>
              {t('credit.utilization')}
            </Text>
            <Text
              className={
                utilization < 30
                  ? 'text-sm font-semibold text-green-700'
                  : utilization < 60
                    ? 'text-sm font-semibold text-yellow-700'
                    : 'text-sm font-semibold text-red-700'
              }
              style={ta}
            >
              {utilization.toFixed(1)}%
            </Text>
          </View>
          <ProgressBar
            value={utilization}
            height={8}
            gradient={['#4ade80', '#dc2626']}
          />
          <View style={rtlRowMerge(rtl, { justifyContent: 'space-between', marginTop: 8 })}>
            <Text className="text-xs text-gray-500" style={ta}>
              {t('credit.used')} {formatEGP(totalDebt, locale)}
            </Text>
            <Text className="text-xs text-gray-500" style={ta}>
              {t('credit.limit')} {formatEGP(totalLimit, locale)}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1" style={ta}>
            {utilization < 30
              ? `✅ ${t('credit.utilGreat')}`
              : utilization < 60
                ? `⚠️ ${t('credit.utilWatch')}`
                : `🚨 ${t('credit.utilHigh')}`}
          </Text>
        </Card>

        <View>
          <Text className="text-lg text-gray-800 font-semibold mb-3" style={ta}>
            {t('credit.yourCards')}
          </Text>
          <View className="gap-3">
            {cards.map((card) => {
              const cardUtil = (card.balance / card.limit) * 100;
              return (
                <PressableCard
                  key={card.id}
                  padded={false}
                  onPress={() => setActiveCard(card)}
                  className="overflow-hidden"
                >
                  <LinearGradient
                    colors={[card.color, '#000000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 16 }}
                  >
                    <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 })}>
                      <Text className="text-white/80 text-sm" style={ta}>
                        {cardDisplayName(card.id, t, card.name)}
                      </Text>
                      <CreditIcon size={24} color={colors.white} />
                    </View>
                    <Text className="text-white text-lg tracking-widest mb-2" style={ta}>
                      •••• •••• •••• {card.last4}
                    </Text>
                    <View style={rtlRowMerge(rtl, { justifyContent: 'space-between' })}>
                      <View>
                        <Text className="text-white/70 text-[10px] uppercase" style={ta}>
                          {t('credit.balance')}
                        </Text>
                        <Text className="text-white font-semibold" style={ta}>
                          {formatEGP(card.balance, locale)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-white/70 text-[10px] uppercase" style={ta}>
                          {t('credit.limitLabel')}
                        </Text>
                        <Text className="text-white font-semibold" style={ta}>
                          {formatEGP(card.limit, locale)}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                  <View className="p-3">
                    <ProgressBar
                      value={cardUtil}
                      height={4}
                      color={
                        cardUtil < 30
                          ? '#16a34a'
                          : cardUtil < 60
                            ? colors.accent[500]
                            : '#dc2626'
                      }
                    />
                    <Text className="text-xs text-gray-500 mt-1" style={ta}>
                      {t('credit.cardUsedApr', {
                        pct: cardUtil.toFixed(0),
                        apr: card.apr,
                      })}
                    </Text>
                  </View>
                </PressableCard>
              );
            })}
          </View>
        </View>

        <Card>
          <Text className="text-gray-800 font-semibold mb-3" style={ta}>
            {t('credit.scoreFactors')}
          </Text>
          <View className="gap-3">
            {factors.map((f) => {
              const isGood = f.score >= 70;
              return (
                <View key={f.name}>
                  <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 })}>
                    <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
                      {isGood ? (
                        <CheckCircle2 size={14} color="#16a34a" />
                      ) : (
                        <AlertCircle size={14} color="#ea580c" />
                      )}
                      <Text className="text-sm text-gray-700" style={ta}>
                        {f.name}
                      </Text>
                    </View>
                    <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
                      <Text className="text-xs text-gray-500" style={ta}>
                        {f.score.toFixed(0)}%
                      </Text>
                      <View className="bg-gray-100 px-2 py-0.5 rounded">
                        <Text className="text-[10px] text-gray-700 font-semibold" style={ta}>
                          {f.weight}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <ProgressBar
                    value={f.score}
                    height={4}
                    color={isGood ? '#16a34a' : colors.accent[500]}
                  />
                </View>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text className="text-gray-800 font-semibold mb-1" style={ta}>
            {t('credit.tryScenario')}
          </Text>
          <Text className="text-xs text-gray-500 mb-3" style={ta}>
            {t('credit.tryScenarioHint')}
          </Text>
          <View style={rtlRowMerge(rtl, { flexWrap: 'wrap' })} className="-m-1">
            {QUICK_SCENARIOS.map((s) => {
              const def = CREDIT_ACTION_DEFINITIONS[s.key];
              const label = creditActionLabel(s.key, locale);
              return (
                <View key={s.key} style={{ width: '50%' }} className="p-1">
                  <Pressable
                    onPress={() => handleScenario(s.key)}
                    className="border border-gray-200 rounded-xl p-3 active:bg-gray-50"
                  >
                    <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 4 })}>
                      <Text className="text-lg">{s.emoji}</Text>
                      <Text
                        className={
                          s.positive
                            ? 'text-[11px] font-bold text-green-700'
                            : 'text-[11px] font-bold text-red-700'
                        }
                        style={ta}
                      >
                        {def.delta >= 0 ? '+' : ''}
                        {def.delta}
                      </Text>
                    </View>
                    <Text
                      className="text-sm text-gray-800 font-medium"
                      numberOfLines={2}
                      style={ta}
                    >
                      {label}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </Card>

        {actions.length > 0 && (
          <Card>
            <Text className="text-gray-800 font-semibold mb-3" style={ta}>
              {t('credit.recentActivity')}
            </Text>
            <View className="gap-2">
              {actions.slice(0, 5).map((a) => {
                const badge = (
                  <View
                    className="px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor:
                        a.scoreImpact >= 0 ? '#dcfce7' : '#fee2e2',
                    }}
                  >
                    <Text
                      className={
                        a.scoreImpact >= 0
                          ? 'text-xs font-bold text-green-700'
                          : 'text-xs font-bold text-red-700'
                      }
                      style={ta}
                    >
                      {a.scoreImpact >= 0 ? '+' : ''}
                      {a.scoreImpact}
                    </Text>
                  </View>
                );
                const textBlock = (
                  <View style={localeTextBesideIconStyle(rtl)}>
                    <Text className="text-sm text-gray-800 font-medium" style={ta}>
                      {creditActionLabelForAction(a, locale)}
                    </Text>
                    <Text className="text-xs text-gray-500" numberOfLines={1} style={ta}>
                      {new Date(a.at).toLocaleString(
                        locale === 'ar' ? 'ar-EG' : 'en-GB'
                      )}
                    </Text>
                  </View>
                );
                return (
                  <View
                    key={a.id}
                    className="py-2 border-b border-gray-100 last:border-b-0"
                    style={localeIconRowStyle(rtl)}
                  >
                    {rtl ? (
                      <>
                        {badge}
                        {textBlock}
                      </>
                    ) : (
                      <>
                        {textBlock}
                        {badge}
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-100">
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 8 })}>
            <TrendingUp size={18} color="#2563eb" />
            <Text className="text-gray-800 font-semibold" style={ta}>
              {t('credit.healthTips')}
            </Text>
          </View>
          <View className="gap-2">
            {[t('credit.tip1'), t('credit.tip2'), t('credit.tip3'), t('credit.tip4')].map(
              (tip) => (
                <View key={tip} style={localeIconRowStyle(rtl)}>
                  {rtl ? (
                    <>
                      <Text className="text-sm text-gray-600" style={ta}>
                        {tip}
                      </Text>
                      <Text className="text-sm text-green-700">✓</Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-sm text-green-700">✓</Text>
                      <Text className="text-sm text-gray-600 flex-1" style={ta}>
                        {tip}
                      </Text>
                    </>
                  )}
                </View>
              )
            )}
          </View>
        </Card>
      </ScrollView>

      <PaymentModal
        card={activeCard}
        onClose={() => setActiveCard(null)}
        onPay={(amount) => {
          if (!activeCard) return;
          const ok = makePayment(activeCard.id, amount);
          if (!ok.ok) {
            Alert.alert(t('sim.oops'), ok.reason ?? t('credit.paymentFailed'));
            return;
          }
          const fullBalance = activeCard.balance <= amount;
          const actionType = fullBalance ? 'pay_full_balance' : 'pay_on_time';
          const result = applyAction(actionType);
          Alert.alert(
            t('credit.paymentMade'),
            `${t('credit.paidAmount', { amount: formatEGP(amount, locale) })}\n\n${t('credit.actionDelta', {
              label: creditActionLabel(actionType, locale),
              delta: `+${result.delta}`,
            })}`
          );
          setActiveCard(null);
        }}
      />
    </View>
  );
}

interface PaymentModalProps {
  card: CreditCardType | null;
  onClose: () => void;
  onPay: (amount: number) => void;
}

function PaymentModal({ card, onClose, onPay }: PaymentModalProps) {
  const { t, locale, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const [amount, setAmount] = useState('');

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const n = parseFloat(amount);
  const valid = Number.isFinite(n) && n > 0;

  return (
    <Modal
      visible={card !== null}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={handleClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View className="bg-white rounded-t-3xl p-5 pb-8">
              <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 })}>
                <View>
                  <Text className="text-xl text-gray-900 font-bold" style={ta}>
                    {t('credit.payCard', {
                      name: card
                        ? cardDisplayName(card.id, t, card.name)
                        : '',
                    })}
                  </Text>
                  <Text className="text-xs text-gray-500" style={ta}>
                    •••• {card?.last4}
                  </Text>
                </View>
                <Pressable
                  onPress={handleClose}
                  hitSlop={12}
                  className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
                >
                  <X size={18} color={colors.gray[700]} />
                </Pressable>
              </View>

              <View className="bg-orange-50 rounded-xl p-3 mb-4">
                <Text className="text-xs text-gray-600" style={ta}>
                  {t('credit.currentBalance')}
                </Text>
                <Text className="text-lg text-orange-700 font-semibold" style={ta}>
                  {formatEGP(card?.balance ?? 0, locale)}
                </Text>
              </View>

              <Text className="text-sm text-gray-700 mb-2 font-medium" style={ta}>
                {t('credit.paymentAmount')}
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.gray[400]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-2xl text-gray-900 mb-3"
                style={ta}
              />

              <View style={rtlRowMerge(rtl, { gap: 8, marginBottom: 16 })}>
                <Pressable
                  onPress={() => setAmount(String(Math.round((card?.balance ?? 0) * 0.1)))}
                  className="flex-1 items-center py-2 rounded-full bg-gray-100"
                >
                  <Text className="text-gray-800 font-medium text-sm" style={ta}>
                    {t('credit.pct10')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAmount(String(Math.round((card?.balance ?? 0) * 0.25)))}
                  className="flex-1 items-center py-2 rounded-full bg-gray-100"
                >
                  <Text className="text-gray-800 font-medium text-sm" style={ta}>
                    {t('credit.pct25')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAmount(String(Math.round((card?.balance ?? 0) * 0.5)))}
                  className="flex-1 items-center py-2 rounded-full bg-gray-100"
                >
                  <Text className="text-gray-800 font-medium text-sm" style={ta}>
                    {t('credit.pct50')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAmount(String(card?.balance ?? 0))}
                  className="flex-1 items-center py-2 rounded-full bg-primary-100"
                >
                  <Text className="text-primary-800 font-semibold text-sm" style={ta}>
                    {t('credit.full')}
                  </Text>
                </Pressable>
              </View>

              <Button
                variant="primary"
                fullWidth
                disabled={!valid}
                onPress={() => {
                  if (!valid) return;
                  onPay(n);
                  setAmount('');
                }}
              >
                {valid
                  ? t('credit.payAmount', { amount: formatEGP(n, locale) })
                  : t('credit.payAmount', { amount: '' })}
              </Button>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
