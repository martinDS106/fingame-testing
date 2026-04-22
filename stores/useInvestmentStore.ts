import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  pushInvestmentTrade,
  upsertInvestmentHolding,
} from '@/lib/syncService';
import { useUserStore } from '@/stores/useUserStore';

import { asyncStorage } from './storage';

function syncTrade(trade: TradeEntry) {
  const userId = useUserStore.getState().remoteUserId;
  if (!userId) return;
  void pushInvestmentTrade(userId, trade);
}

function syncHolding(holding: { symbol: string; shares: number; avgCost: number }) {
  const userId = useUserStore.getState().remoteUserId;
  if (!userId) return;
  void upsertInvestmentHolding(userId, holding);
}

export type StockSector = 'Banking' | 'Telecom' | 'Industrial' | 'Consumer' | 'Energy';

export interface Stock {
  symbol: string;
  name: string;
  sector: StockSector;
  price: number;
  change: number;
  changePct: number;
}

export interface Holding {
  symbol: string;
  shares: number;
  avgCost: number;
}

export interface TradeEntry {
  id: string;
  symbol: string;
  action: 'buy' | 'sell';
  shares: number;
  price: number;
  orderType?: OrderType;
  at: number;
}

export type OrderType = 'market' | 'limit' | 'stop_loss';

export interface PendingOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'stop_loss';
  shares: number;
  triggerPrice: number;
  createdAt: number;
  status: 'open' | 'filled' | 'cancelled';
}

interface InvestmentState {
  cash: number;
  stocks: Stock[];
  holdings: Holding[];
  trades: TradeEntry[];
  orders: PendingOrder[];
  priceHistory: Record<string, number[]>;
  lastTickAt: number | null;

  portfolioValue: () => number;
  totalPnL: () => number;
  holdingFor: (symbol: string) => Holding | undefined;
  stockFor: (symbol: string) => Stock | undefined;

  buy: (symbol: string, shares: number) => { ok: boolean; reason?: string };
  sell: (symbol: string, shares: number) => { ok: boolean; reason?: string };
  updatePrices: (nextPrices: Record<string, number>) => void;
  addCash: (amount: number) => void;

  // Market engine
  tickMarket: () => void;

  // Order types
  placeOrder: (
    symbol: string,
    side: 'buy' | 'sell',
    type: 'limit' | 'stop_loss',
    shares: number,
    triggerPrice: number
  ) => { ok: boolean; reason?: string };
  cancelOrder: (id: string) => void;
  openOrdersFor: (symbol: string) => PendingOrder[];
}

const initialStocks: Stock[] = [
  {
    symbol: 'COMI',
    name: 'Commercial International Bank',
    sector: 'Banking',
    price: 78.5,
    change: 1.2,
    changePct: 1.55,
  },
  {
    symbol: 'ETEL',
    name: 'Telecom Egypt',
    sector: 'Telecom',
    price: 24.3,
    change: -0.4,
    changePct: -1.62,
  },
  {
    symbol: 'HRHO',
    name: 'EFG Hermes Holding',
    sector: 'Banking',
    price: 18.6,
    change: 0.35,
    changePct: 1.92,
  },
  {
    symbol: 'TMGH',
    name: 'Talaat Moustafa Group',
    sector: 'Consumer',
    price: 12.8,
    change: 0.25,
    changePct: 1.99,
  },
  {
    symbol: 'SWDY',
    name: 'ElSewedy Electric',
    sector: 'Industrial',
    price: 34.1,
    change: -0.5,
    changePct: -1.45,
  },
];

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const SECTOR_VOLATILITY: Record<StockSector, number> = {
  Banking: 0.012,
  Telecom: 0.008,
  Industrial: 0.014,
  Consumer: 0.01,
  Energy: 0.018,
};

const HISTORY_LIMIT = 60;

function randomWalk(price: number, volatility: number): number {
  // Geometric-Brownian-ish step with slight upward drift.
  const drift = 0.0001;
  const shock = (Math.random() - 0.5) * 2 * volatility;
  const next = price * (1 + drift + shock);
  return Math.max(0.1, Number(next.toFixed(2)));
}

export const useInvestmentStore = create<InvestmentState>()(
  persist(
    (set, get) => ({
      cash: 100000,
      stocks: initialStocks,
      holdings: [],
      trades: [],
      orders: [],
      priceHistory: Object.fromEntries(
        initialStocks.map((s) => [s.symbol, [s.price]])
      ),
      lastTickAt: null,

      portfolioValue: () => {
        const { holdings, stocks } = get();
        return holdings.reduce((sum, h) => {
          const s = stocks.find((st) => st.symbol === h.symbol);
          return sum + (s ? s.price * h.shares : 0);
        }, 0);
      },

      totalPnL: () => {
        const { holdings, stocks } = get();
        return holdings.reduce((sum, h) => {
          const s = stocks.find((st) => st.symbol === h.symbol);
          if (!s) return sum;
          return sum + (s.price - h.avgCost) * h.shares;
        }, 0);
      },

      holdingFor: (symbol) =>
        get().holdings.find((h) => h.symbol === symbol),

      stockFor: (symbol) =>
        get().stocks.find((s) => s.symbol === symbol),

      buy: (symbol, shares) => {
        if (shares <= 0) return { ok: false, reason: 'Invalid shares' };
        const state = get();
        const stock = state.stocks.find((s) => s.symbol === symbol);
        if (!stock) return { ok: false, reason: 'Unknown stock' };
        const cost = stock.price * shares;
        if (state.cash < cost)
          return { ok: false, reason: 'Not enough cash' };

        const existing = state.holdings.find((h) => h.symbol === symbol);
        const newHoldings: Holding[] = existing
          ? state.holdings.map((h) => {
              if (h.symbol !== symbol) return h;
              const totalCost = h.avgCost * h.shares + cost;
              const totalShares = h.shares + shares;
              return {
                ...h,
                shares: totalShares,
                avgCost: totalCost / totalShares,
              };
            })
          : [...state.holdings, { symbol, shares, avgCost: stock.price }];

        const trade: TradeEntry = {
          id: makeId('trd'),
          symbol,
          action: 'buy',
          shares,
          price: stock.price,
          at: Date.now(),
        };
        set({
          cash: state.cash - cost,
          holdings: newHoldings,
          trades: [trade, ...state.trades].slice(0, 200),
        });
        syncTrade(trade);
        const updated = newHoldings.find((h) => h.symbol === symbol);
        if (updated) syncHolding(updated);
        return { ok: true };
      },

      sell: (symbol, shares) => {
        if (shares <= 0) return { ok: false, reason: 'Invalid shares' };
        const state = get();
        const stock = state.stocks.find((s) => s.symbol === symbol);
        if (!stock) return { ok: false, reason: 'Unknown stock' };
        const holding = state.holdings.find((h) => h.symbol === symbol);
        if (!holding || holding.shares < shares)
          return { ok: false, reason: 'Not enough shares' };

        const proceeds = stock.price * shares;
        const newHoldings = state.holdings
          .map((h) =>
            h.symbol === symbol ? { ...h, shares: h.shares - shares } : h
          )
          .filter((h) => h.shares > 0);

        const trade: TradeEntry = {
          id: makeId('trd'),
          symbol,
          action: 'sell',
          shares,
          price: stock.price,
          at: Date.now(),
        };
        set({
          cash: state.cash + proceeds,
          holdings: newHoldings,
          trades: [trade, ...state.trades].slice(0, 200),
        });
        syncTrade(trade);
        const remaining = newHoldings.find((h) => h.symbol === symbol);
        syncHolding(
          remaining ?? { symbol, shares: 0, avgCost: holding.avgCost }
        );
        return { ok: true };
      },

      updatePrices: (nextPrices) => {
        set((state) => ({
          stocks: state.stocks.map((s) => {
            const next = nextPrices[s.symbol];
            if (next == null) return s;
            const change = next - s.price;
            const changePct = s.price ? (change / s.price) * 100 : 0;
            return { ...s, price: next, change, changePct };
          }),
        }));
      },

      addCash: (amount) => {
        if (amount <= 0) return;
        set((state) => ({ cash: state.cash + amount }));
      },

      tickMarket: () => {
        const state = get();

        // 1. Step each stock price.
        const nextStocks: Stock[] = state.stocks.map((s) => {
          const vol = SECTOR_VOLATILITY[s.sector] ?? 0.01;
          const nextPrice = randomWalk(s.price, vol);
          const change = nextPrice - s.price;
          const changePct = s.price ? (change / s.price) * 100 : 0;
          return { ...s, price: nextPrice, change, changePct };
        });

        // 2. Append to price history, cap length.
        const nextHistory: Record<string, number[]> = { ...state.priceHistory };
        nextStocks.forEach((s) => {
          const prev = nextHistory[s.symbol] ?? [];
          const updated = [...prev, s.price];
          nextHistory[s.symbol] =
            updated.length > HISTORY_LIMIT
              ? updated.slice(updated.length - HISTORY_LIMIT)
              : updated;
        });

        set({
          stocks: nextStocks,
          priceHistory: nextHistory,
          lastTickAt: Date.now(),
        });

        // 3. Check pending orders and try to fill them.
        const { orders } = get();
        const openOrders = orders.filter((o) => o.status === 'open');
        openOrders.forEach((order) => {
          const stock = nextStocks.find((s) => s.symbol === order.symbol);
          if (!stock) return;

          // Trigger rules:
          //  - limit BUY:  fill when price <= triggerPrice
          //  - limit SELL: fill when price >= triggerPrice
          //  - stop_loss:  fill (SELL only) when price <= triggerPrice
          const shouldFill =
            (order.type === 'limit' && order.side === 'buy' && stock.price <= order.triggerPrice) ||
            (order.type === 'limit' && order.side === 'sell' && stock.price >= order.triggerPrice) ||
            (order.type === 'stop_loss' && stock.price <= order.triggerPrice);

          if (!shouldFill) return;

          const exec =
            order.side === 'buy'
              ? get().buy(order.symbol, order.shares)
              : get().sell(order.symbol, order.shares);

          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === order.id
                ? { ...o, status: exec.ok ? 'filled' : 'cancelled' }
                : o
            ),
          }));
        });
      },

      placeOrder: (symbol, side, type, shares, triggerPrice) => {
        if (shares <= 0) return { ok: false, reason: 'Invalid shares' };
        if (triggerPrice <= 0) return { ok: false, reason: 'Invalid trigger price' };
        const stock = get().stocks.find((s) => s.symbol === symbol);
        if (!stock) return { ok: false, reason: 'Unknown stock' };

        if (side === 'sell') {
          const h = get().holdings.find((x) => x.symbol === symbol);
          if (!h || h.shares < shares) {
            return { ok: false, reason: 'Not enough shares to sell' };
          }
        } else if (type === 'limit') {
          const estCost = triggerPrice * shares;
          if (get().cash < estCost) {
            return { ok: false, reason: 'Not enough cash for this limit' };
          }
        }

        const order: PendingOrder = {
          id: makeId('ord'),
          symbol,
          side,
          type,
          shares,
          triggerPrice,
          createdAt: Date.now(),
          status: 'open',
        };

        set((state) => ({
          orders: [order, ...state.orders].slice(0, 100),
        }));
        return { ok: true };
      },

      cancelOrder: (id) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id && o.status === 'open'
              ? { ...o, status: 'cancelled' }
              : o
          ),
        }));
      },

      openOrdersFor: (symbol) =>
        get().orders.filter(
          (o) => o.symbol === symbol && o.status === 'open'
        ),
    }),
    {
      name: 'fin-game/investment',
      storage: createJSONStorage(() => asyncStorage),
      version: 2,
      migrate: (persisted: any, version) => {
        // v1 -> v2: bump starting cash to EGP 100,000 for fresh users.
        if (version < 2 && persisted && typeof persisted === 'object') {
          const cash = Number(persisted.cash ?? 0);
          const hasPositions =
            Array.isArray(persisted.holdings) && persisted.holdings.length > 0;
          const hasTrades = Array.isArray(persisted.trades) && persisted.trades.length > 0;

          if (!hasPositions && !hasTrades && cash > 0 && cash < 100000) {
            return { ...persisted, cash: 100000 };
          }
        }
        return persisted;
      },
      partialize: (state) => ({
        cash: state.cash,
        stocks: state.stocks,
        holdings: state.holdings,
        trades: state.trades,
        orders: state.orders,
        priceHistory: state.priceHistory,
      }),
    }
  )
);
