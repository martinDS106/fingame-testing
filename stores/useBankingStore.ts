import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { pushBankingTransaction } from '@/lib/syncServiceApi';
import { useUserStore } from '@/stores/useUserStore';

import { asyncStorage } from './storage';

function syncTxn(txn: Transaction) {
  const userId = useUserStore.getState().remoteUserId;
  if (!userId) return;
  void pushBankingTransaction(userId, txn);
}

export type AccountType = 'checking' | 'savings';

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  balance: number;
}

export type TxnCategory =
  | 'salary'
  | 'food'
  | 'transport'
  | 'bills'
  | 'shopping'
  | 'entertainment'
  | 'education'
  | 'savings_transfer'
  | 'other';

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'transfer';
  category: TxnCategory;
  note?: string;
  at: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  emoji: string;
}

interface BankingState {
  accounts: Account[];
  transactions: Transaction[];
  goals: SavingsGoal[];

  totalBalance: () => number;
  balanceOf: (accountId: string) => number;

  deposit: (accountId: string, amount: number, category: TxnCategory, note?: string) => void;
  withdraw: (accountId: string, amount: number, category: TxnCategory, note?: string) => boolean;
  transfer: (fromId: string, toId: string, amount: number, note?: string) => boolean;

  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => string;
  contributeToGoal: (goalId: string, fromAccountId: string, amount: number) => boolean;
  removeGoal: (goalId: string) => void;
}

const initialAccounts: Account[] = [
  { id: 'acc-checking', type: 'checking', name: 'Main Checking', balance: 8500 },
  { id: 'acc-savings', type: 'savings', name: 'Savings', balance: 12500 },
];

const initialGoals: SavingsGoal[] = [
  {
    id: 'goal-car',
    title: 'New Car',
    targetAmount: 50000,
    currentAmount: 12500,
    emoji: '🚗',
  },
  {
    id: 'goal-vacation',
    title: 'Summer Vacation',
    targetAmount: 15000,
    currentAmount: 4200,
    emoji: '🏖️',
  },
];

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useBankingStore = create<BankingState>()(
  persist(
    (set, get) => ({
      accounts: initialAccounts,
      transactions: [],
      goals: initialGoals,

      totalBalance: () =>
        get().accounts.reduce((sum, a) => sum + a.balance, 0),

      balanceOf: (accountId) =>
        get().accounts.find((a) => a.id === accountId)?.balance ?? 0,

      deposit: (accountId, amount, category, note) => {
        if (amount <= 0) return;
        const txn: Transaction = {
          id: makeId('txn'),
          accountId,
          amount,
          type: 'deposit',
          category,
          note,
          at: Date.now(),
        };
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === accountId ? { ...a, balance: a.balance + amount } : a
          ),
          transactions: [txn, ...state.transactions].slice(0, 200),
        }));
        syncTxn(txn);
      },

      withdraw: (accountId, amount, category, note) => {
        if (amount <= 0) return false;
        const acc = get().accounts.find((a) => a.id === accountId);
        if (!acc || acc.balance < amount) return false;
        const txn: Transaction = {
          id: makeId('txn'),
          accountId,
          amount,
          type: 'withdraw',
          category,
          note,
          at: Date.now(),
        };
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === accountId ? { ...a, balance: a.balance - amount } : a
          ),
          transactions: [txn, ...state.transactions].slice(0, 200),
        }));
        syncTxn(txn);
        return true;
      },

      transfer: (fromId, toId, amount, note) => {
        if (amount <= 0 || fromId === toId) return false;
        const from = get().accounts.find((a) => a.id === fromId);
        if (!from || from.balance < amount) return false;
        const txn: Transaction = {
          id: makeId('txn'),
          accountId: fromId,
          amount,
          type: 'transfer',
          category: 'savings_transfer',
          note: note ?? `Transfer to ${toId}`,
          at: Date.now(),
        };
        set((state) => ({
          accounts: state.accounts.map((a) => {
            if (a.id === fromId) return { ...a, balance: a.balance - amount };
            if (a.id === toId) return { ...a, balance: a.balance + amount };
            return a;
          }),
          transactions: [txn, ...state.transactions].slice(0, 200),
        }));
        syncTxn(txn);
        return true;
      },

      addGoal: (goal) => {
        const id = makeId('goal');
        set((state) => ({
          goals: [...state.goals, { ...goal, id, currentAmount: 0 }],
        }));
        return id;
      },

      contributeToGoal: (goalId, fromAccountId, amount) => {
        const ok = get().withdraw(
          fromAccountId,
          amount,
          'savings_transfer',
          `Contribution to goal ${goalId}`
        );
        if (!ok) return false;
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? { ...g, currentAmount: g.currentAmount + amount }
              : g
          ),
        }));
        return true;
      },

      removeGoal: (goalId) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== goalId),
        })),
    }),
    {
      name: 'fin-game/banking',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        accounts: state.accounts,
        transactions: state.transactions,
        goals: state.goals,
      }),
    }
  )
);
