import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { asyncStorage } from './storage';

export type BusinessStepId =
  | 'idea'
  | 'market_research'
  | 'business_plan'
  | 'legal_setup'
  | 'funding'
  | 'location'
  | 'hiring'
  | 'marketing'
  | 'launch'
  | 'scale';

export interface BusinessStep {
  id: BusinessStepId;
  title: string;
  description: string;
  completed: boolean;
  unlocked: boolean;
}

export interface BusinessDecision {
  id: string;
  stepId: BusinessStepId;
  optionId: string;
  impactOnCash: number;
  impactOnReputation: number;
  at: number;
}

export interface MonthlyReport {
  id: string;
  month: number;
  revenue: number;
  expenses: number;
  vatCollected: number;
  grossProfit: number;
  corporateTax: number;
  netProfit: number;
  at: number;
}

interface BusinessState {
  currentStep: BusinessStepId;
  steps: BusinessStep[];
  cash: number;
  reputation: number;
  monthsRunning: number;
  revenue: number;
  expenses: number;
  vatPayable: number;
  corpTaxPayable: number;
  decisions: BusinessDecision[];
  reports: MonthlyReport[];

  netProfit: () => number;
  grossProfit: () => number;
  effectiveTaxRate: () => number;
  progressPct: () => number;

  completeStep: (stepId: BusinessStepId) => void;
  makeDecision: (
    stepId: BusinessStepId,
    optionId: string,
    impactOnCash: number,
    impactOnReputation: number
  ) => void;
  runMonth: (monthlyRevenue: number, monthlyExpenses: number) => MonthlyReport;
  payTaxes: () => { paid: number; ok: boolean; reason?: string };
  reset: () => void;
}

const defaultSteps: BusinessStep[] = [
  {
    id: 'idea',
    title: 'Business Idea',
    description: 'Pick a niche and validate it',
    completed: false,
    unlocked: true,
  },
  {
    id: 'market_research',
    title: 'Market Research',
    description: 'Understand your customers and competitors',
    completed: false,
    unlocked: false,
  },
  {
    id: 'business_plan',
    title: 'Business Plan',
    description: 'Draft revenue model, costs, and milestones',
    completed: false,
    unlocked: false,
  },
  {
    id: 'legal_setup',
    title: 'Legal Setup',
    description: 'Register the company and handle permits',
    completed: false,
    unlocked: false,
  },
  {
    id: 'funding',
    title: 'Funding',
    description: 'Bootstrap, loan, or raise capital',
    completed: false,
    unlocked: false,
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Pick a physical or online presence',
    completed: false,
    unlocked: false,
  },
  {
    id: 'hiring',
    title: 'Hiring',
    description: 'Assemble your first team',
    completed: false,
    unlocked: false,
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Build brand and acquire early customers',
    completed: false,
    unlocked: false,
  },
  {
    id: 'launch',
    title: 'Launch',
    description: 'Open doors and process first orders',
    completed: false,
    unlocked: false,
  },
  {
    id: 'scale',
    title: 'Scale',
    description: 'Grow revenue and optimize operations',
    completed: false,
    unlocked: false,
  },
];

function nextStep(steps: BusinessStep[], current: BusinessStepId): BusinessStepId {
  const idx = steps.findIndex((s) => s.id === current);
  if (idx < 0 || idx === steps.length - 1) return current;
  return steps[idx + 1].id;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const INITIAL_CASH = 25000;

// Egyptian tax rules (simplified, 2025 baseline):
//   - VAT (القيمة المضافة): 14% على المبيعات
//   - Corporate income tax (ضريبة الشركات): 22.5% على صافى الربح
export const VAT_RATE = 0.14;
export const CORP_TAX_RATE = 0.225;

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      currentStep: 'idea',
      steps: defaultSteps,
      cash: INITIAL_CASH,
      reputation: 50,
      monthsRunning: 0,
      revenue: 0,
      expenses: 0,
      vatPayable: 0,
      corpTaxPayable: 0,
      decisions: [],
      reports: [],

      grossProfit: () => {
        const { revenue, expenses } = get();
        return revenue - expenses;
      },

      netProfit: () => {
        const { revenue, expenses, vatPayable, corpTaxPayable } = get();
        return revenue - expenses - vatPayable - corpTaxPayable;
      },

      effectiveTaxRate: () => {
        const { revenue, expenses, vatPayable, corpTaxPayable } = get();
        const gross = revenue - expenses;
        if (gross <= 0) return 0;
        return ((vatPayable + corpTaxPayable) / gross) * 100;
      },

      progressPct: () => {
        const { steps } = get();
        const done = steps.filter((s) => s.completed).length;
        return (done / steps.length) * 100;
      },

      completeStep: (stepId) => {
        set((state) => {
          const updatedSteps = state.steps.map((s) =>
            s.id === stepId ? { ...s, completed: true } : s
          );
          const nextId = nextStep(state.steps, stepId);
          const withNextUnlocked = updatedSteps.map((s) =>
            s.id === nextId ? { ...s, unlocked: true } : s
          );
          return {
            steps: withNextUnlocked,
            currentStep: nextId,
          };
        });
      },

      makeDecision: (stepId, optionId, impactOnCash, impactOnReputation) => {
        set((state) => ({
          cash: state.cash + impactOnCash,
          reputation: Math.max(
            0,
            Math.min(100, state.reputation + impactOnReputation)
          ),
          decisions: [
            {
              id: makeId('dec'),
              stepId,
              optionId,
              impactOnCash,
              impactOnReputation,
              at: Date.now(),
            },
            ...state.decisions,
          ].slice(0, 200),
        }));
      },

      runMonth: (monthlyRevenue, monthlyExpenses) => {
        const gross = monthlyRevenue - monthlyExpenses;
        const vat = Math.max(0, monthlyRevenue * VAT_RATE);
        const corpTax = gross > 0 ? gross * CORP_TAX_RATE : 0;
        const net = gross - vat - corpTax;

        const report: MonthlyReport = {
          id: makeId('rep'),
          month: get().monthsRunning + 1,
          revenue: monthlyRevenue,
          expenses: monthlyExpenses,
          vatCollected: vat,
          grossProfit: gross,
          corporateTax: corpTax,
          netProfit: net,
          at: Date.now(),
        };

        set((state) => ({
          monthsRunning: state.monthsRunning + 1,
          revenue: state.revenue + monthlyRevenue,
          expenses: state.expenses + monthlyExpenses,
          vatPayable: state.vatPayable + vat,
          corpTaxPayable: state.corpTaxPayable + corpTax,
          cash: state.cash + gross, // taxes are owed but not yet paid
          reports: [report, ...state.reports].slice(0, 60),
        }));

        return report;
      },

      payTaxes: () => {
        const { cash, vatPayable, corpTaxPayable } = get();
        const due = vatPayable + corpTaxPayable;
        if (due <= 0) {
          return { paid: 0, ok: true };
        }
        if (cash < due) {
          return {
            paid: 0,
            ok: false,
            reason: `Need ${Math.round(due)} EGP but cash is ${Math.round(cash)}.`,
          };
        }
        set((state) => ({
          cash: state.cash - due,
          vatPayable: 0,
          corpTaxPayable: 0,
        }));
        return { paid: due, ok: true };
      },

      reset: () =>
        set({
          currentStep: 'idea',
          steps: defaultSteps,
          cash: INITIAL_CASH,
          reputation: 50,
          monthsRunning: 0,
          revenue: 0,
          expenses: 0,
          vatPayable: 0,
          corpTaxPayable: 0,
          decisions: [],
          reports: [],
        }),
    }),
    {
      name: 'fin-game/business',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
);
