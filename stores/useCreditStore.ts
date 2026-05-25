import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { asyncStorage } from './storage';

export interface CreditCard {
  id: string;
  name: string;
  last4: string;
  limit: number;
  balance: number;
  apr: number;
  color: string;
}

export interface CreditAction {
  id: string;
  type?: CreditActionType;
  label: string;
  scoreImpact: number;
  description: string;
  at: number;
}

export type CreditActionType =
  | 'pay_on_time'
  | 'pay_late'
  | 'pay_full_balance'
  | 'max_out_card'
  | 'open_new_card'
  | 'close_old_card'
  | 'bnpl_responsible'
  | 'bnpl_missed';

interface CreditState {
  score: number;
  cards: CreditCard[];
  actions: CreditAction[];
  lastUpdated: number;

  utilization: () => number;
  totalDebt: () => number;
  totalLimit: () => number;

  applyAction: (type: CreditActionType) => { delta: number; message: string };
  makePayment: (cardId: string, amount: number) => {
    ok: boolean;
    reason?: string;
  };
  chargeCard: (cardId: string, amount: number) => {
    ok: boolean;
    reason?: string;
  };
  resetScore: () => void;
}

const initialCards: CreditCard[] = [
  {
    id: 'card-visa',
    name: 'Visa Classic',
    last4: '4321',
    limit: 20000,
    balance: 4800,
    apr: 32,
    color: '#1e40af',
  },
  {
    id: 'card-mc',
    name: 'MasterCard Gold',
    last4: '8765',
    limit: 35000,
    balance: 12400,
    apr: 28,
    color: '#b45309',
  },
];

const ACTION_DEFINITIONS: Record<
  CreditActionType,
  { label: string; delta: number; description: string }
> = {
  pay_on_time: {
    label: 'Paid bill on time',
    delta: 5,
    description: 'Consistent payments build history.',
  },
  pay_late: {
    label: 'Missed a payment',
    delta: -30,
    description: 'Late payments hurt your score fast.',
  },
  pay_full_balance: {
    label: 'Paid full balance',
    delta: 10,
    description: 'Low utilization boosts your score.',
  },
  max_out_card: {
    label: 'Maxed out a card',
    delta: -25,
    description: 'Utilization > 90% is a red flag.',
  },
  open_new_card: {
    label: 'Opened a new card',
    delta: -8,
    description: 'Hard inquiry + shorter avg age.',
  },
  close_old_card: {
    label: 'Closed an old card',
    delta: -12,
    description: 'Shortens credit history.',
  },
  bnpl_responsible: {
    label: 'Pay-later plan paid on schedule',
    delta: 3,
    description: 'Small boost when used responsibly.',
  },
  bnpl_missed: {
    label: 'Missed pay-later installment',
    delta: -15,
    description: 'BNPL defaults now report to bureaus.',
  },
};

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useCreditStore = create<CreditState>()(
  persist(
    (set, get) => ({
      score: 720,
      cards: initialCards,
      actions: [],
      lastUpdated: Date.now(),

      utilization: () => {
        const { cards } = get();
        const total = cards.reduce((sum, c) => sum + c.limit, 0);
        const used = cards.reduce((sum, c) => sum + c.balance, 0);
        if (total === 0) return 0;
        return (used / total) * 100;
      },

      totalDebt: () =>
        get().cards.reduce((sum, c) => sum + c.balance, 0),

      totalLimit: () =>
        get().cards.reduce((sum, c) => sum + c.limit, 0),

      applyAction: (type) => {
        const def = ACTION_DEFINITIONS[type];
        const state = get();
        let cards = state.cards.map((c) => ({ ...c }));

        switch (type) {
          case 'pay_full_balance':
            cards = cards.map((c) => ({ ...c, balance: 0 }));
            break;
          case 'max_out_card': {
            const target = cards[0];
            if (target) {
              cards[0] = {
                ...target,
                balance: Math.floor(target.limit * 0.95),
              };
            }
            break;
          }
          case 'open_new_card':
            if (cards.length < 4) {
              cards.push({
                id: makeId('card'),
                name: 'Starter Card',
                last4: String(1000 + Math.floor(Math.random() * 9000)),
                limit: 15000,
                balance: 0,
                apr: 30,
                color: '#059669',
              });
            }
            break;
          case 'close_old_card':
            if (cards.length > 1) cards = cards.slice(1);
            break;
          case 'pay_on_time': {
            const target = cards.find((c) => c.balance > 0) ?? cards[0];
            if (target) {
              const pay = Math.min(target.balance, Math.max(500, target.balance * 0.25));
              cards = cards.map((c) =>
                c.id === target.id ? { ...c, balance: c.balance - pay } : c
              );
            }
            break;
          }
          case 'pay_late': {
            const target = cards[0];
            if (target) {
              cards[0] = {
                ...target,
                balance: Math.min(target.limit, target.balance + 300),
              };
            }
            break;
          }
          default:
            break;
        }

        const newScore = Math.max(300, Math.min(850, state.score + def.delta));

        set({
          score: newScore,
          cards,
          lastUpdated: Date.now(),
          actions: [
            {
              id: makeId('act'),
              type,
              label: def.label,
              scoreImpact: def.delta,
              description: def.description,
              at: Date.now(),
            },
            ...state.actions,
          ].slice(0, 50),
        });

        return { delta: def.delta, message: def.description };
      },

      makePayment: (cardId, amount) => {
        if (amount <= 0) return { ok: false, reason: 'Invalid amount' };
        const card = get().cards.find((c) => c.id === cardId);
        if (!card) return { ok: false, reason: 'Card not found' };
        const applied = Math.min(amount, card.balance);
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, balance: c.balance - applied } : c
          ),
        }));
        return { ok: true };
      },

      chargeCard: (cardId, amount) => {
        if (amount <= 0) return { ok: false, reason: 'Invalid amount' };
        const card = get().cards.find((c) => c.id === cardId);
        if (!card) return { ok: false, reason: 'Card not found' };
        if (card.balance + amount > card.limit)
          return { ok: false, reason: 'Exceeds credit limit' };
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, balance: c.balance + amount } : c
          ),
        }));
        return { ok: true };
      },

      resetScore: () =>
        set({
          score: 720,
          cards: initialCards,
          actions: [],
          lastUpdated: Date.now(),
        }),
    }),
    {
      name: 'fin-game/credit',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
);

export { ACTION_DEFINITIONS as CREDIT_ACTION_DEFINITIONS };
