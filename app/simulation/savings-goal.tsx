import { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Target, Trash2, X } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { formatEGP } from '@/lib/format';
import { localizeSavingsGoalTitle } from '@/lib/savingsGoalsLocale';
import {
  localeIconRowStyle,
  localeTextBesideIconStyle,
  mergeScrollContentRtl,
  rtlRootDirection,
  rtlRow,
  rtlRowMerge,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { notifyError } from '@/lib/celebration';
import { useBankingStore, type SavingsGoal } from '@/stores';

const EMOJIS = ['🚗', '🏖️', '🏠', '📱', '💍', '🎓', '💼', '✈️'];

export default function SavingsGoalScreen() {
  const { t, locale, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const goals = useBankingStore((s) => s.goals);
  const accounts = useBankingStore((s) => s.accounts);
  const addGoal = useBankingStore((s) => s.addGoal);
  const removeGoal = useBankingStore((s) => s.removeGoal);
  const contributeToGoal = useBankingStore((s) => s.contributeToGoal);

  const [addOpen, setAddOpen] = useState(false);
  const [contribFor, setContribFor] = useState<SavingsGoal | null>(null);

  const checking = accounts.find((a) => a.type === 'checking');

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('savings.screenTitle')}
        showBack
        showBell={false}
        rightSlot={
          <Pressable
            onPress={() => setAddOpen(true)}
            hitSlop={8}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Plus size={20} color={colors.white} />
          </Pressable>
        }
      />

      <ScrollView
        className="flex-1"
        style={rtlRootDirection(rtl)}
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 32, gap: 16 })}
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 && (
          <Card className="items-center py-8">
            <Text className="text-5xl mb-3">🎯</Text>
            <Text className="text-lg text-gray-800 font-semibold mb-1" style={ta}>
              {t('savings.noGoals')}
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-4" style={ta}>
              {t('savings.noGoalsBody')}
            </Text>
            <Button
              variant="primary"
              leftIcon={<Plus size={16} color={colors.white} />}
              onPress={() => setAddOpen(true)}
            >
              {t('savings.addGoal')}
            </Button>
          </Card>
        )}

        {goals.map((goal) => {
          const pct = Math.min(
            100,
            (goal.currentAmount / goal.targetAmount) * 100
          );
          const remaining = Math.max(
            0,
            goal.targetAmount - goal.currentAmount
          );
          return (
            <Card key={goal.id} padded={false} className="overflow-hidden">
              <LinearGradient
                colors={[colors.primary[500], '#9333ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ padding: 16 }}
              >
                <View style={localeIconRowStyle(rtl)}>
                  {rtl ? (
                    <>
                      <Pressable
                        hitSlop={8}
                        onPress={() =>
                          Alert.alert(
                            t('savings.deleteTitle'),
                            t('savings.deleteBody', {
                              title: localizeSavingsGoalTitle(
                                goal.id,
                                goal.title,
                                locale
                              ),
                            }),
                            [
                              { text: t('action.cancel'), style: 'cancel' },
                              {
                                text: t('savings.delete'),
                                style: 'destructive',
                                onPress: () => removeGoal(goal.id),
                              },
                            ]
                          )
                        }
                        className="p-1.5 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                      >
                        <Trash2 size={16} color={colors.white} />
                      </Pressable>
                      <View style={localeTextBesideIconStyle(rtl)}>
                        <Text className="text-white font-semibold text-lg" style={ta}>
                          {localizeSavingsGoalTitle(goal.id, goal.title, locale)}
                        </Text>
                        <Text className="text-white/80 text-sm" style={ta}>
                          {t('savings.target')}{' '}
                          {formatEGP(goal.targetAmount, locale)}
                        </Text>
                      </View>
                      <Text className="text-4xl">{goal.emoji}</Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-4xl">{goal.emoji}</Text>
                      <View className="flex-1">
                        <Text className="text-white font-semibold text-lg" style={ta}>
                          {localizeSavingsGoalTitle(goal.id, goal.title, locale)}
                        </Text>
                        <Text className="text-white/80 text-sm" style={ta}>
                          {t('savings.target')}{' '}
                          {formatEGP(goal.targetAmount, locale)}
                        </Text>
                      </View>
                      <Pressable
                        hitSlop={8}
                        onPress={() =>
                          Alert.alert(
                            t('savings.deleteTitle'),
                            t('savings.deleteBody', {
                              title: localizeSavingsGoalTitle(
                                goal.id,
                                goal.title,
                                locale
                              ),
                            }),
                        [
                          { text: t('action.cancel'), style: 'cancel' },
                          {
                            text: t('savings.delete'),
                            style: 'destructive',
                            onPress: () => removeGoal(goal.id),
                          },
                        ]
                      )
                    }
                    className="p-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <Trash2 size={16} color={colors.white} />
                  </Pressable>
                    </>
                  )}
                </View>
              </LinearGradient>

              <View className="p-4">
                <View style={localeIconRowStyle(rtl)}>
                  {rtl ? (
                    <>
                      <Text className="text-sm text-gray-600 font-medium" style={ta}>
                        {pct.toFixed(0)}%
                      </Text>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text className="text-sm text-gray-600" style={ta}>
                          {t('savings.saved', {
                            amount: formatEGP(goal.currentAmount, locale),
                          })}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text className="text-sm text-gray-600" style={ta}>
                        {t('savings.saved', {
                          amount: formatEGP(goal.currentAmount, locale),
                        })}
                      </Text>
                      <Text className="text-sm text-gray-600 font-medium" style={ta}>
                        {pct.toFixed(0)}%
                      </Text>
                    </>
                  )}
                </View>
                <ProgressBar
                  value={pct}
                  height={8}
                  gradient={[colors.primary[500], '#9333ea']}
                />
                <Text
                  className="text-xs text-gray-500 mt-2"
                  style={[ta, rtl ? { alignSelf: 'flex-end' } : undefined]}
                >
                  {remaining > 0
                    ? t('savings.toGo', { amount: formatEGP(remaining, locale) })
                    : t('savings.goalReached')}
                </Text>

                <View className="mt-4">
                  <Button
                    variant="primary"
                    fullWidth
                    onPress={() => setContribFor(goal)}
                    disabled={remaining === 0}
                  >
                    {remaining === 0
                      ? t('savings.completed')
                      : t('savings.addContribution')}
                  </Button>
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <AddGoalModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(goal) => {
          addGoal(goal);
          setAddOpen(false);
        }}
      />

      <ContributeModal
        goal={contribFor}
        checkingBalance={checking?.balance ?? 0}
        onClose={() => setContribFor(null)}
        onContribute={(amount) => {
          if (!contribFor || !checking) return;
          const ok = contributeToGoal(contribFor.id, checking.id, amount);
          if (!ok) {
            notifyError(t('sim.oops'), t('savings.notEnoughChecking'));
            return;
          }
          setContribFor(null);
        }}
      />
    </View>
  );
}

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (goal: {
    title: string;
    targetAmount: number;
    emoji: string;
  }) => void;
}

function AddGoalModal({ visible, onClose, onAdd }: AddGoalModalProps) {
  const { t, locale, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState('🎯');

  const reset = () => {
    setTitle('');
    setTarget('');
    setEmoji('🎯');
  };

  const handleAdd = () => {
    const n = parseFloat(target);
    if (!title.trim() || !Number.isFinite(n) || n <= 0) return;
    onAdd({ title: title.trim(), targetAmount: n, emoji });
    reset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        reset();
        onClose();
      }}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={() => {
          reset();
          onClose();
        }}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View className="bg-white rounded-t-3xl p-5 pb-8">
              <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 })}>
                <Text className="text-xl text-gray-900 font-bold" style={ta}>
                  {t('savings.newGoal')}
                </Text>
                <Pressable
                  onPress={() => {
                    reset();
                    onClose();
                  }}
                  hitSlop={12}
                  className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
                >
                  <X size={18} color={colors.gray[700]} />
                </Pressable>
              </View>

              <Text className="text-sm text-gray-700 mb-2 font-medium" style={ta}>
                {t('savings.goalName')}
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={t('savings.goalPlaceholder')}
                placeholderTextColor={colors.gray[400]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
                style={ta}
              />

              <Text className="text-sm text-gray-700 mb-2 font-medium" style={ta}>
                {t('savings.targetAmount')}
              </Text>
              <TextInput
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.gray[400]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-2xl text-gray-900 mb-4"
                style={ta}
              />

              <Text className="text-sm text-gray-700 mb-2 font-medium" style={ta}>
                {t('savings.icon')}
              </Text>
              <View className="-m-1 mb-4" style={rtlRowMerge(rtl, { flexWrap: 'wrap' })}>
                {EMOJIS.map((e) => {
                  const active = e === emoji;
                  return (
                    <Pressable
                      key={e}
                      onPress={() => setEmoji(e)}
                      className={`m-1 w-12 h-12 rounded-xl items-center justify-center border ${
                        active
                          ? 'bg-primary-50 border-primary-500'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className="text-2xl">{e}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Button variant="primary" fullWidth onPress={handleAdd}>
                {t('savings.createGoal')}
              </Button>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface ContributeModalProps {
  goal: SavingsGoal | null;
  checkingBalance: number;
  onClose: () => void;
  onContribute: (amount: number) => void;
}

function ContributeModal({
  goal,
  checkingBalance,
  onClose,
  onContribute,
}: ContributeModalProps) {
  const { t, locale, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const [amount, setAmount] = useState('');

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const handleConfirm = () => {
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    onContribute(n);
    setAmount('');
  };

  return (
    <Modal
      visible={goal !== null}
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
                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
                  <Text className="text-2xl">{goal?.emoji}</Text>
                  <View>
                    <Text className="text-lg text-gray-900 font-bold" style={ta}>
                      {t('savings.contribute')}
                    </Text>
                    <Text className="text-xs text-gray-500" style={ta}>
                      {t('savings.contributeTo', { title: goal?.title ?? '' })}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleClose}
                  hitSlop={12}
                  className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
                >
                  <X size={18} color={colors.gray[700]} />
                </Pressable>
              </View>

              <View className="bg-primary-50 rounded-xl p-3 mb-4">
                <Text className="text-xs text-gray-600" style={ta}>
                  {t('banking.checkingBalance')}
                </Text>
                <Text className="text-lg text-primary-700 font-semibold" style={ta}>
                  {formatEGP(checkingBalance, locale)}
                </Text>
              </View>

              <Text className="text-sm text-gray-700 mb-2 font-medium" style={ta}>
                {t('banking.amountEGP')}
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

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={rtlRootDirection(rtl)}
                contentContainerStyle={mergeScrollContentRtl(rtl, {
                  gap: 8,
                  ...rtlRow(rtl),
                })}
              >
                {[100, 500, 1000, 2500].map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setAmount(String(p))}
                    className="px-4 py-2 rounded-full bg-gray-100"
                  >
                    <Text className="text-gray-800 font-medium" style={ta}>
                      {formatEGP(p, locale)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View className="mt-5">
                <Button
                  variant="primary"
                  fullWidth
                  onPress={handleConfirm}
                  leftIcon={<Target size={16} color={colors.white} />}
                >
                  {t('savings.contribute')}
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
