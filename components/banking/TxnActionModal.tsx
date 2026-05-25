import { useEffect, useMemo, useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { formatEGP } from '@/lib/format';
import { useBankingStore, type TxnCategory } from '@/stores';
import { useT } from '@/hooks/useT';
import {
  mergeScrollContentRtl,
  rtlRootDirection,
  rtlRow,
  rtlRowMerge,
  rtlTextStyle,
} from '@/lib/rtlStyle';

export type TxnAction = 'deposit' | 'withdraw' | 'pay_bill' | 'transfer';

const AMOUNT_ACCESSORY_ID = 'banking-txn-amount-accessory';

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
  const { t, locale, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const insets = useSafeAreaInsets();
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

  const dismissKeyboard = () => Keyboard.dismiss();

  const handleBackdropPress = () => {
    dismissKeyboard();
    onClose();
  };

  const handleConfirm = () => {
    if (!action || !config || !checking || !savings) return;
    setError(null);
    dismissKeyboard();

    if (amountNum <= 0) {
      setError(t('action.enterValidAmount'));
      return;
    }

    const cat = config.categories[categoryIdx];
    const note = `${t(config.titleKey)} · ${t(cat.labelKey)}`;

    if (action === 'deposit') {
      deposit(checking.id, amountNum, cat.key, note);
      setSuccessMsg(t('banking.deposited', { amt: formatEGP(amountNum, locale) }));
    } else if (action === 'withdraw' || action === 'pay_bill') {
      const ok = withdraw(checking.id, amountNum, cat.key, note);
      if (!ok) {
        setError(t('banking.notEnoughChecking'));
        return;
      }
      setSuccessMsg(
        action === 'pay_bill'
          ? t('banking.paid', { amt: formatEGP(amountNum, locale) })
          : t('banking.spent', { amt: formatEGP(amountNum, locale) })
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
      setSuccessMsg(t('banking.movedToSavings', { amt: formatEGP(amountNum, locale) }));
    }

    setAmount('');
  };

  const amountAccessory =
    Platform.OS === 'ios' ? (
      <InputAccessoryView nativeID={AMOUNT_ACCESSORY_ID}>
        <View style={styles.accessoryBar}>
          <Pressable
            onPress={dismissKeyboard}
            hitSlop={8}
            style={styles.accessoryDoneBtn}
          >
            <Text style={styles.accessoryDoneText}>{t('common.done')}</Text>
          </Pressable>
        </View>
      </InputAccessoryView>
    ) : null;

  return (
    <Modal
      visible={action !== null}
      transparent
      animationType="slide"
      onRequestClose={() => {
        dismissKeyboard();
        onClose();
      }}
    >
      {amountAccessory}
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <Pressable style={styles.backdrop} onPress={handleBackdropPress} />

        <View
          style={[styles.sheet, rtlRootDirection(rtl)]}
          onStartShouldSetResponder={() => true}
        >
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View
              style={rtlRowMerge(rtl, {
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              })}
            >
              <View style={styles.titleBlock}>
                <Text style={[ta, styles.title]}>
                  {config ? t(config.titleKey) : ''}
                </Text>
                <Text style={[ta, styles.subtitle]}>
                  {config ? t(config.descriptionKey) : ''}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  dismissKeyboard();
                  onClose();
                }}
                hitSlop={12}
                style={styles.closeBtn}
              >
                <X size={18} color={colors.gray[700]} />
              </Pressable>
            </View>

            <View style={styles.balanceBox}>
              <Text style={[ta, styles.balanceLabel]}>
                {t('banking.checkingBalance')}
              </Text>
              <Text style={[ta, styles.balanceValue]}>
                {checking ? formatEGP(checking.balance, locale) : '—'}
              </Text>
            </View>

            <Text style={[ta, styles.fieldLabel]}>{t('banking.amountEGP')}</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
              inputAccessoryViewID={
                Platform.OS === 'ios' ? AMOUNT_ACCESSORY_ID : undefined
              }
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={dismissKeyboard}
              placeholder="0"
              placeholderTextColor={colors.gray[400]}
              style={[styles.amountInput, ta]}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={rtlRootDirection(rtl)}
              contentContainerStyle={mergeScrollContentRtl(rtl, {
                gap: 8,
                paddingBottom: 4,
                ...rtlRow(rtl),
              })}
            >
              {PRESETS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setAmount(String(p))}
                  style={styles.presetChip}
                >
                  <Text style={[ta, styles.presetText]}>
                    {formatEGP(p, locale)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {config && config.categories.length > 1 && (
              <>
                <Text style={[ta, styles.fieldLabel, { marginTop: 16 }]}>
                  {t('banking.category')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={rtlRootDirection(rtl)}
                  contentContainerStyle={mergeScrollContentRtl(rtl, {
                    gap: 8,
                    paddingBottom: 4,
                    ...rtlRow(rtl),
                  })}
                >
                  {config.categories.map((cat, idx) => {
                    const active = idx === categoryIdx;
                    return (
                      <Pressable
                        key={`${cat.key}-${idx}`}
                        onPress={() => setCategoryIdx(idx)}
                        style={[
                          styles.catChip,
                          active ? styles.catChipActive : styles.catChipIdle,
                        ]}
                      >
                        <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                        <Text
                          style={[
                            ta,
                            active ? styles.catTextActive : styles.catTextIdle,
                          ]}
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
              <View style={styles.errorBox}>
                <Text style={[ta, styles.errorText]}>{error}</Text>
              </View>
            )}
            {successMsg && !error && (
              <View style={styles.successBox}>
                <Text style={[ta, styles.successText]}>{successMsg}</Text>
              </View>
            )}
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={rtlRowMerge(rtl, { gap: 12 })}>
              <View style={styles.footerBtn}>
                <Button
                  variant="secondary"
                  fullWidth
                  onPress={() => {
                    dismissKeyboard();
                    onClose();
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </View>
              <View style={styles.footerBtn}>
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: colors.primary[50],
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[700],
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    color: colors.gray[900],
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.gray[100],
  },
  presetText: {
    color: colors.gray[800],
    fontWeight: '500',
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  catChipActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  catChipIdle: {
    backgroundColor: colors.white,
    borderColor: colors.gray[200],
  },
  catTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  catTextIdle: {
    color: colors.gray[700],
    fontWeight: '500',
  },
  errorBox: {
    marginTop: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#b91c1c',
  },
  successBox: {
    marginTop: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 12,
  },
  successText: {
    fontSize: 14,
    color: '#15803d',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  footerBtn: {
    flex: 1,
  },
  accessoryBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.gray[100],
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  accessoryDoneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  accessoryDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[600],
  },
});
