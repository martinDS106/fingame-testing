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
import { rewardFor } from '@/lib/rewards';
import {
  CREDIT_ACTION_DEFINITIONS,
  useCreditStore,
  useUserStore,
  type CreditActionType,
  type CreditCard as CreditCardType,
} from '@/stores';

function scoreCategory(score: number) {
  if (score >= 800)
    return { label: 'Excellent', color: '#16a34a', bg: '#dcfce7' };
  if (score >= 740)
    return { label: 'Very Good', color: '#2563eb', bg: '#dbeafe' };
  if (score >= 670) return { label: 'Good', color: '#ca8a04', bg: '#fef3c7' };
  if (score >= 580) return { label: 'Fair', color: '#ea580c', bg: '#ffedd5' };
  return { label: 'Poor', color: '#dc2626', bg: '#fee2e2' };
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

  const category = useMemo(() => scoreCategory(score), [score]);
  const pct = ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;
  const radius = 80;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;

  const handleScenario = (type: CreditActionType) => {
    const def = CREDIT_ACTION_DEFINITIONS[type];
    const result = applyAction(type);

    if (result.delta > 0) {
      const reward = rewardFor('quiz_correct');
      addCoins(reward.coins, 'quiz_correct');
      addXP(reward.xp);
    }

    Alert.alert(
      def.label,
      `Score ${result.delta >= 0 ? '+' : ''}${result.delta} points\n\n${def.description}`
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset score?',
      'This will reset score to 720 and clear history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetScore(),
        },
      ]
    );
  };

  const factors = [
    {
      name: 'Payment History',
      score: Math.min(100, Math.max(40, 95 - actions.filter((a) => a.scoreImpact < 0).length * 5)),
      weight: '35%',
    },
    {
      name: 'Credit Utilization',
      score: Math.max(0, 100 - utilization),
      weight: '30%',
    },
    { name: 'Credit Mix', score: cards.length >= 2 ? 75 : 50, weight: '15%' },
    { name: 'Account Age', score: 72, weight: '15%' },
    {
      name: 'New Credit',
      score: Math.max(
        30,
        100 - actions.filter((a) => a.label.includes('new card')).length * 15
      ),
      weight: '10%',
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Credit Score Builder"
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
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
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
          <Text className="text-orange-100 text-sm mb-4">
            Your Credit Score
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
              <Text className="text-6xl text-white font-bold">{score}</Text>
              <Text className="text-xs text-orange-100">
                out of {SCORE_MAX}
              </Text>
            </View>
          </View>

          <View
            className="mt-4 px-4 py-1 rounded-full"
            style={{ backgroundColor: category.bg }}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: category.color }}
            >
              {category.label}
            </Text>
          </View>
        </LinearGradient>

        <Card>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-800 font-semibold">
              Credit Utilization
            </Text>
            <Text
              className={
                utilization < 30
                  ? 'text-sm font-semibold text-green-700'
                  : utilization < 60
                    ? 'text-sm font-semibold text-yellow-700'
                    : 'text-sm font-semibold text-red-700'
              }
            >
              {utilization.toFixed(1)}%
            </Text>
          </View>
          <ProgressBar
            value={utilization}
            height={8}
            gradient={['#4ade80', '#dc2626']}
          />
          <View className="flex-row justify-between mt-2">
            <Text className="text-xs text-gray-500">
              Used: {formatEGP(totalDebt)}
            </Text>
            <Text className="text-xs text-gray-500">
              Limit: {formatEGP(totalLimit)}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            {utilization < 30
              ? '✅ Great — keep below 30%'
              : utilization < 60
                ? '⚠️ Watch out — try paying some down'
                : '🚨 High utilization damages your score'}
          </Text>
        </Card>

        <View>
          <Text className="text-lg text-gray-800 font-semibold mb-3">
            Your Cards
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
                    <View className="flex-row items-center justify-between mb-8">
                      <Text className="text-white/80 text-sm">
                        {card.name}
                      </Text>
                      <CreditIcon size={24} color={colors.white} />
                    </View>
                    <Text className="text-white text-lg tracking-widest mb-2">
                      •••• •••• •••• {card.last4}
                    </Text>
                    <View className="flex-row justify-between">
                      <View>
                        <Text className="text-white/70 text-[10px] uppercase">
                          Balance
                        </Text>
                        <Text className="text-white font-semibold">
                          {formatEGP(card.balance)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-white/70 text-[10px] uppercase">
                          Limit
                        </Text>
                        <Text className="text-white font-semibold">
                          {formatEGP(card.limit)}
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
                    <Text className="text-xs text-gray-500 mt-1">
                      {cardUtil.toFixed(0)}% used · {card.apr}% APR
                    </Text>
                  </View>
                </PressableCard>
              );
            })}
          </View>
        </View>

        <Card>
          <Text className="text-gray-800 font-semibold mb-3">
            Score Factors
          </Text>
          <View className="gap-3">
            {factors.map((f) => {
              const isGood = f.score >= 70;
              return (
                <View key={f.name}>
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-row items-center gap-2">
                      {isGood ? (
                        <CheckCircle2 size={14} color="#16a34a" />
                      ) : (
                        <AlertCircle size={14} color="#ea580c" />
                      )}
                      <Text className="text-sm text-gray-700">{f.name}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs text-gray-500">{f.score.toFixed(0)}%</Text>
                      <View className="bg-gray-100 px-2 py-0.5 rounded">
                        <Text className="text-[10px] text-gray-700 font-semibold">
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
          <Text className="text-gray-800 font-semibold mb-1">
            Try a Scenario
          </Text>
          <Text className="text-xs text-gray-500 mb-3">
            Tap an action to see its impact on your score.
          </Text>
          <View className="flex-row flex-wrap -m-1">
            {QUICK_SCENARIOS.map((s) => {
              const def = CREDIT_ACTION_DEFINITIONS[s.key];
              return (
                <View key={s.key} style={{ width: '50%' }} className="p-1">
                  <Pressable
                    onPress={() => handleScenario(s.key)}
                    className="border border-gray-200 rounded-xl p-3 active:bg-gray-50"
                  >
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-lg">{s.emoji}</Text>
                      <Text
                        className={
                          s.positive
                            ? 'text-[11px] font-bold text-green-700'
                            : 'text-[11px] font-bold text-red-700'
                        }
                      >
                        {def.delta >= 0 ? '+' : ''}
                        {def.delta}
                      </Text>
                    </View>
                    <Text
                      className="text-sm text-gray-800 font-medium"
                      numberOfLines={2}
                    >
                      {def.label}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </Card>

        {actions.length > 0 && (
          <Card>
            <Text className="text-gray-800 font-semibold mb-3">
              Recent Activity
            </Text>
            <View className="gap-2">
              {actions.slice(0, 5).map((a) => (
                <View
                  key={a.id}
                  className="flex-row items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-sm text-gray-800 font-medium">
                      {a.label}
                    </Text>
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {new Date(a.at).toLocaleString('en-GB')}
                    </Text>
                  </View>
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
                    >
                      {a.scoreImpact >= 0 ? '+' : ''}
                      {a.scoreImpact}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-100">
          <View className="flex-row items-center gap-2 mb-2">
            <TrendingUp size={18} color="#2563eb" />
            <Text className="text-gray-800 font-semibold">
              Credit Health Tips
            </Text>
          </View>
          <View className="gap-1">
            <Text className="text-sm text-gray-600">
              ✓ Pay all bills on time — biggest factor
            </Text>
            <Text className="text-sm text-gray-600">
              ✓ Keep credit utilization below 30%
            </Text>
            <Text className="text-sm text-gray-600">
              ✓ Don&apos;t close old credit accounts
            </Text>
            <Text className="text-sm text-gray-600">
              ✓ Limit new credit applications
            </Text>
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
            Alert.alert('Oops', ok.reason ?? 'Payment failed');
            return;
          }
          const fullBalance = activeCard.balance <= amount;
          const result = applyAction(
            fullBalance ? 'pay_full_balance' : 'pay_on_time'
          );
          const def = CREDIT_ACTION_DEFINITIONS[
            fullBalance ? 'pay_full_balance' : 'pay_on_time'
          ];
          Alert.alert(
            'Payment made',
            `Paid ${formatEGP(amount)}\n\n${def.label}: +${result.delta} score`
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
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-xl text-gray-900 font-bold">
                    Pay {card?.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
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
                <Text className="text-xs text-gray-600">Current Balance</Text>
                <Text className="text-lg text-orange-700 font-semibold">
                  {formatEGP(card?.balance ?? 0)}
                </Text>
              </View>

              <Text className="text-sm text-gray-700 mb-2 font-medium">
                Payment amount (EGP)
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.gray[400]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-2xl text-gray-900 mb-3"
              />

              <View className="flex-row gap-2 mb-4">
                <Pressable
                  onPress={() => setAmount(String(Math.round((card?.balance ?? 0) * 0.1)))}
                  className="flex-1 items-center py-2 rounded-full bg-gray-100"
                >
                  <Text className="text-gray-800 font-medium text-sm">
                    10%
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAmount(String(Math.round((card?.balance ?? 0) * 0.25)))}
                  className="flex-1 items-center py-2 rounded-full bg-gray-100"
                >
                  <Text className="text-gray-800 font-medium text-sm">
                    25%
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAmount(String(Math.round((card?.balance ?? 0) * 0.5)))}
                  className="flex-1 items-center py-2 rounded-full bg-gray-100"
                >
                  <Text className="text-gray-800 font-medium text-sm">
                    50%
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAmount(String(card?.balance ?? 0))}
                  className="flex-1 items-center py-2 rounded-full bg-primary-100"
                >
                  <Text className="text-primary-800 font-semibold text-sm">
                    Full
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
                Pay {valid ? formatEGP(n) : ''}
              </Button>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
