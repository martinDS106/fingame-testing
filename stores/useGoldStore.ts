import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { asyncStorage } from './storage';

export type MetalType = 'gold_24k' | 'gold_21k' | 'gold_18k' | 'silver';

export interface MetalPrice {
  type: MetalType;
  label: string;
  pricePerGram: number;
  change: number;
  changePct: number;
}

export interface MetalHolding {
  type: MetalType;
  grams: number;
  avgCost: number;
}

export interface MetalTrade {
  id: string;
  type: MetalType;
  action: 'buy' | 'sell';
  grams: number;
  pricePerGram: number;
  at: number;
}

interface GoldState {
  cash: number;
  prices: MetalPrice[];
  holdings: MetalHolding[];
  trades: MetalTrade[];

  priceFor: (type: MetalType) => MetalPrice | undefined;
  holdingFor: (type: MetalType) => MetalHolding | undefined;
  portfolioValue: () => number;
  totalPnL: () => number;

  buy: (type: MetalType, grams: number) => { ok: boolean; reason?: string };
  sell: (type: MetalType, grams: number) => { ok: boolean; reason?: string };
  updatePrices: (next: Partial<Record<MetalType, number>>) => void;
  /** Small random walk so the gold screen "live prices" stay in motion. */
  tickPrices: () => void;
  addCash: (amount: number) => void;
}

const initialPrices: MetalPrice[] = [
  { type: 'gold_24k', label: 'Gold 24K', pricePerGram: 3850, change: 25, changePct: 0.65 },
  { type: 'gold_21k', label: 'Gold 21K', pricePerGram: 3370, change: 22, changePct: 0.66 },
  { type: 'gold_18k', label: 'Gold 18K', pricePerGram: 2890, change: 19, changePct: 0.66 },
  { type: 'silver', label: 'Silver', pricePerGram: 48, change: -0.5, changePct: -1.03 },
];

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useGoldStore = create<GoldState>()(
  persist(
    (set, get) => ({
      cash: 50000,
      prices: initialPrices,
      holdings: [],
      trades: [],

      priceFor: (type) => get().prices.find((p) => p.type === type),
      holdingFor: (type) => get().holdings.find((h) => h.type === type),

      portfolioValue: () => {
        const { holdings, prices } = get();
        return holdings.reduce((sum, h) => {
          const p = prices.find((pr) => pr.type === h.type);
          return sum + (p ? p.pricePerGram * h.grams : 0);
        }, 0);
      },

      totalPnL: () => {
        const { holdings, prices } = get();
        return holdings.reduce((sum, h) => {
          const p = prices.find((pr) => pr.type === h.type);
          if (!p) return sum;
          return sum + (p.pricePerGram - h.avgCost) * h.grams;
        }, 0);
      },

      buy: (type, grams) => {
        if (grams <= 0) return { ok: false, reason: 'Invalid amount' };
        const state = get();
        const price = state.prices.find((p) => p.type === type);
        if (!price) return { ok: false, reason: 'Unknown metal' };
        const cost = price.pricePerGram * grams;
        if (state.cash < cost)
          return { ok: false, reason: 'Not enough cash' };

        const existing = state.holdings.find((h) => h.type === type);
        const newHoldings: MetalHolding[] = existing
          ? state.holdings.map((h) => {
              if (h.type !== type) return h;
              const totalCost = h.avgCost * h.grams + cost;
              const totalGrams = h.grams + grams;
              return {
                ...h,
                grams: totalGrams,
                avgCost: totalCost / totalGrams,
              };
            })
          : [
              ...state.holdings,
              { type, grams, avgCost: price.pricePerGram },
            ];

        set({
          cash: state.cash - cost,
          holdings: newHoldings,
          trades: [
            {
              id: makeId('gtrd'),
              type,
              action: 'buy',
              grams,
              pricePerGram: price.pricePerGram,
              at: Date.now(),
            },
            ...state.trades,
          ].slice(0, 200),
        });
        return { ok: true };
      },

      sell: (type, grams) => {
        if (grams <= 0) return { ok: false, reason: 'Invalid amount' };
        const state = get();
        const price = state.prices.find((p) => p.type === type);
        if (!price) return { ok: false, reason: 'Unknown metal' };
        const holding = state.holdings.find((h) => h.type === type);
        if (!holding || holding.grams < grams)
          return { ok: false, reason: 'Not enough metal' };

        const proceeds = price.pricePerGram * grams;
        const newHoldings = state.holdings
          .map((h) =>
            h.type === type ? { ...h, grams: h.grams - grams } : h
          )
          .filter((h) => h.grams > 0);

        set({
          cash: state.cash + proceeds,
          holdings: newHoldings,
          trades: [
            {
              id: makeId('gtrd'),
              type,
              action: 'sell',
              grams,
              pricePerGram: price.pricePerGram,
              at: Date.now(),
            },
            ...state.trades,
          ].slice(0, 200),
        });
        return { ok: true };
      },

      updatePrices: (next) => {
        set((state) => ({
          prices: state.prices.map((p) => {
            const nextPrice = next[p.type];
            if (nextPrice == null) return p;
            const change = nextPrice - p.pricePerGram;
            const changePct = p.pricePerGram
              ? (change / p.pricePerGram) * 100
              : 0;
            return { ...p, pricePerGram: nextPrice, change, changePct };
          }),
        }));
      },

      tickPrices: () => {
        const jitter: Partial<Record<MetalType, number>> = {};
        for (const p of get().prices) {
          const pct = (Math.random() - 0.5) * 0.012;
          jitter[p.type] = Math.max(1, Math.round(p.pricePerGram * (1 + pct)));
        }
        get().updatePrices(jitter);
      },

      addCash: (amount) => {
        if (amount <= 0) return;
        set((state) => ({ cash: state.cash + amount }));
      },
    }),
    {
      name: 'fin-game/gold',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        cash: state.cash,
        prices: state.prices,
        holdings: state.holdings,
        trades: state.trades,
      }),
    }
  )
);
