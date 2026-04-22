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
import { useBankingStore, type SavingsGoal } from '@/stores';

const EMOJIS = ['🚗', '🏖️', '🏠', '📱', '💍', '🎓', '💼', '✈️'];

export default function SavingsGoalScreen() {
  const goals = useBankingStore((s) => s.goals);
  const accounts = useBankingStore((s) => s.accounts);
  const addGoal = useBankingStore((s) => s.addGoal);
  const removeGoal = useBankingStore((s) => s.removeGoal);
  const contributeToGoal = useBankingStore((s) => s.contributeToGoal);

  const [addOpen, setAddOpen] = useState(false);
  const [contribFor, setContribFor] = useState<SavingsGoal | null>(null);

  const checking = accounts.find((a) => a.type === 'checking');

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Savings Goals"
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
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 && (
          <Card className="items-center py-8">
            <Text className="text-5xl mb-3">🎯</Text>
            <Text className="text-lg text-gray-800 font-semibold mb-1">
              No goals yet
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-4">
              Create your first savings goal and watch it grow.
            </Text>
            <Button
              variant="primary"
              leftIcon={<Plus size={16} color={colors.white} />}
              onPress={() => setAddOpen(true)}
            >
              Add Goal
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
                <View className="flex-row items-center gap-3">
                  <Text className="text-4xl">{goal.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-lg">
                      {goal.title}
                    </Text>
                    <Text className="text-white/80 text-sm">
                      Target: {formatEGP(goal.targetAmount)}
                    </Text>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() =>
                      Alert.alert(
                        'Delete goal?',
                        `Remove "${goal.title}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
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
                </View>
              </LinearGradient>

              <View className="p-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-600">
                    {formatEGP(goal.currentAmount)} saved
                  </Text>
                  <Text className="text-sm text-gray-600 font-medium">
                    {pct.toFixed(0)}%
                  </Text>
                </View>
                <ProgressBar
                  value={pct}
                  height={8}
                  gradient={[colors.primary[500], '#9333ea']}
                />
                <Text className="text-xs text-gray-500 mt-2">
                  {remaining > 0
                    ? `${formatEGP(remaining)} to go`
                    : 'Goal reached! 🎉'}
                </Text>

                <View className="mt-4">
                  <Button
                    variant="primary"
                    fullWidth
                    onPress={() => setContribFor(goal)}
                    disabled={remaining === 0}
                  >
                    {remaining === 0 ? 'Completed' : 'Add Contribution'}
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
            Alert.alert('Oops', 'Not enough balance in checking.');
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
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl text-gray-900 font-bold">
                  New Savings Goal
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

              <Text className="text-sm text-gray-700 mb-2 font-medium">
                Goal name
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Vacation"
                placeholderTextColor={colors.gray[400]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
              />

              <Text className="text-sm text-gray-700 mb-2 font-medium">
                Target amount (EGP)
              </Text>
              <TextInput
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.gray[400]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-2xl text-gray-900 mb-4"
              />

              <Text className="text-sm text-gray-700 mb-2 font-medium">
                Icon
              </Text>
              <View className="flex-row flex-wrap -m-1 mb-4">
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
                Create Goal
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
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl">{goal?.emoji}</Text>
                  <View>
                    <Text className="text-lg text-gray-900 font-bold">
                      Contribute
                    </Text>
                    <Text className="text-xs text-gray-500">
                      to {goal?.title}
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
                <Text className="text-xs text-gray-600">
                  Checking Balance
                </Text>
                <Text className="text-lg text-primary-700 font-semibold">
                  {formatEGP(checkingBalance)}
                </Text>
              </View>

              <Text className="text-sm text-gray-700 mb-2 font-medium">
                Amount (EGP)
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.gray[400]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-2xl text-gray-900 mb-3"
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {[100, 500, 1000, 2500].map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setAmount(String(p))}
                    className="px-4 py-2 rounded-full bg-gray-100"
                  >
                    <Text className="text-gray-800 font-medium">
                      {formatEGP(p)}
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
                  Contribute
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
