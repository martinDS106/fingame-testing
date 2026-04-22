import { useEffect, useMemo, useState } from 'react';
import {
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
import { useBankingStore, type TxnCategory } from '@/stores';
import { useT } from '@/hooks/useT';

export type TxnAction = 'deposit' | 'withdraw' | 'pay_bill' | 'transfer';

interface TxnActionModalProps {
  action: TxnAction | null;
  onClose: () => void;
}

interface ActionConfig {
  titleKey: string;
  descriptionKey: string;
  confirmLabelKey: string;
  defaultCategory: TxnCategory;
  categories: { key: TxnCategory; labelKey: string; emoji: string }[];
}

const CONFIGS: Record<TxnAction, ActionConfig> = {
  deposit: {
    titleKey: 'banking.deposit.title',
    descriptionKey: 'banking.deposit.desc',
    confirmLabelKey: 'banking.deposit.confirm',
    defaultCategory: 'salary',
    categories: [
      { key: 'salary', labelKey: 'banking.deposit.cat.salary', emoji: '💰' },
      { key: 'other', labelKey: 'banking.deposit.cat.other', emoji: '📌' },
    ],
  },
  withdraw: {
    titleKey: 'banking.withdraw.title',
    descriptionKey: 'banking.withdraw.desc',
    confirmLabelKey: 'banking.withdraw.confirm',
    defaultCategory: 'food',
    categories: [
      { key: 'food', labelKey: 'banking.withdraw.cat.food', emoji: '🛒' },
      {
        key: 'transport',
        labelKey: 'banking.withdraw.cat.transport',
        emoji: '🚗',
      },
      { key: 'shopping', labelKey: 'banking.withdraw.cat.shopping', emoji: '🛍️' },
      {
        key: 'entertainment',
        labelKey: 'banking.withdraw.cat.entertainment',
        emoji: '🎬',
      },
      {
        key: 'education',
        labelKey: 'banking.withdraw.cat.education',
        emoji: '🎓',
      },
      { key: 'other', labelKey: 'banking.withdraw.cat.other', emoji: '📌' },
    ],
  },
  pay_bill: {
    titleKey: 'banking.payBill.title',
    descriptionKey: 'banking.payBill.desc',
    confirmLabelKey: 'banking.payBill.confirm',
    defaultCategory: 'bills',
    categories: [
      { key: 'bills', labelKey: 'banking.payBill.cat.utilities', emoji: '💡' },
      { key: 'bills', labelKey: 'banking.payBill.cat.internet', emoji: '📡' },
      { key: 'bills', labelKey: 'banking.payBill.cat.phone', emoji: '📱' },
    ],
  },
  transfer: {
    titleKey: 'banking.transfer.title',
    descriptionKey: 'banking.transfer.desc',
    confirmLabelKey: 'banking.transfer.confirm',
    defaultCategory: 'savings_transfer',
    categories: [
      {
        key: 'savings_transfer',
        labelKey: 'banking.transfer.cat.toSavings',
        emoji: '💸',
      },
    ],
  },
};

const PRESETS = [100, 500, 1000, 5000];

export function TxnActionModal({ action, onClose }: TxnActionModalProps) {
  const { t } = useT();
  const config = action ? CONFIGS[action] : null;
  const [amount, setAmount] = useState('');
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const accounts = useBankingStore((s) => s.accounts);
  const deposit = useBankingStore((s) => s.deposit);
  const withdraw = useBankingStore((s) => s.withdraw);
  const transfer = useBankingStore((s) => s.transfer);

  const checking = accounts.find((a) => a.type === 'checking');
  const savings = accounts.find((a) => a.type === 'savings');

  useEffect(() => {
    setAmount('');
    setCategoryIdx(0);
    setError(null);
    setSuccessMsg(null);
  }, [action]);

  const amountNum = useMemo(() => {
    const n = parseFloat(amount.replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const handleConfirm = () => {
    if (!action || !config || !checking || !savings) return;
    setError(null);

    if (amountNum <= 0) {
      setError(t('action.enterValidAmount'));
      return;
    }

    const cat = config.categories[categoryIdx];
    const note = `${t(config.titleKey)} · ${t(cat.labelKey)}`;

    if (action === 'deposit') {
      deposit(checking.id, amountNum, cat.key, note);
      setSuccessMsg(t('banking.deposited', { amt: formatEGP(amountNum) }));
    } else if (action === 'withdraw' || action === 'pay_bill') {
      const ok = withdraw(checking.id, amountNum, cat.key, note);
      if (!ok) {
        setError(t('banking.notEnoughChecking'));
        return;
      }
      setSuccessMsg(
        action === 'pay_bill'
          ? t('banking.paid', { amt: formatEGP(amountNum) })
          : t('banking.spent', { amt: formatEGP(amountNum) })
      );
    } else if (action === 'transfer') {
      const ok = transfer(
        checking.id,
        savings.id,
        amountNum,
        t('banking.transferToSavingsNote')
      );
      if (!ok) {
        setError(t('banking.notEnoughChecking'));
        return;
      }
      setSuccessMsg(t('banking.movedToSavings', { amt: formatEGP(amountNum) }));
    }

    setAmount('');
  };

  return (
    <Modal
      visible={action !== null}
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
            <View className="bg-white rounded-t-3xl p-5 pb-8">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-xl text-gray-900 font-bold">
                    {config ? t(config.titleKey) : ''}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {config ? t(config.descriptionKey) : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={onClose}
                  hitSlop={12}
                  className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
                >
                  <X size={18} color={colors.gray[700]} />
                </Pressable>
              </View>

              <View
                className="rounded-xl p-3 mb-4"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <Text className="text-xs text-gray-600">
                  {t('banking.checkingBalance')}
                </Text>
                <Text className="text-lg text-primary-700 font-semibold">
                  {checking ? formatEGP(checking.balance) : '—'}
                </Text>
              </View>

              <Text className="text-sm text-gray-700 mb-2 font-medium">
                {t('banking.amountEGP')}
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
                contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
              >
                {PRESETS.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setAmount(String(p))}
                    className="px-4 py-2 rounded-full bg-gray-100 active:bg-gray-200"
                  >
                    <Text className="text-gray-800 font-medium">
                      {formatEGP(p)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {config && config.categories.length > 1 && (
                <>
                  <Text className="text-sm text-gray-700 mt-4 mb-2 font-medium">
                    {t('banking.category')}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                  >
                    {config.categories.map((cat, idx) => {
                      const active = idx === categoryIdx;
                      return (
                        <Pressable
                          key={`${cat.key}-${idx}`}
                          onPress={() => setCategoryIdx(idx)}
                          className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                            active
                              ? 'bg-primary-600 border-primary-600'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <Text className="text-base">{cat.emoji}</Text>
                          <Text
                            className={
                              active
                                ? 'text-white font-medium'
                                : 'text-gray-700 font-medium'
                            }
                          >
                            {t(cat.labelKey)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </>
              )}

              {error && (
                <View className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              )}
              {successMsg && !error && (
                <View className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <Text className="text-sm text-green-700">{successMsg}</Text>
                </View>
              )}

              <View className="mt-5 flex-row gap-3">
                <View className="flex-1">
                  <Button variant="secondary" fullWidth onPress={onClose}>
                    {t('common.cancel')}
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    variant="primary"
                    fullWidth
                    onPress={handleConfirm}
                    disabled={amountNum <= 0}
                  >
                    {config ? t(config.confirmLabelKey) : ''}
                  </Button>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
