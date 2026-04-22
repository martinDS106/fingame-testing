import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { asyncStorage } from './storage';
import { useUserStore } from './useUserStore';
import { rewardFor } from '@/lib/rewards';
import { upsertProgress } from '@/lib/syncService';

export type ChallengeId =
  | 'emergency-fund'
  | 'salary-split'
  | 'credit-mistake'
  | 'installment-trap'
  | 'stock-panic'
  | 'gold-or-cash';

export interface ChallengeOption {
  id: string;
  label: string;
  impactCoins: number;
  impactXP: number;
  impactScore: number; // -100..+100
  explanation: string;
}

export interface ChallengeScenario {
  id: ChallengeId;
  title: string;
  description: string;
  situation: string;
  options: ChallengeOption[];
  coinReward: number; // reward for completing scenario (on top of option impact)
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChallengeAttempt {
  id: string;
  challengeId: ChallengeId;
  optionId: string;
  scoreDelta: number;
  coinsDelta: number;
  xpDelta: number;
  at: number;
}

interface ChallengesState {
  challenges: ChallengeScenario[];
  completed: ChallengeId[];
  attempts: ChallengeAttempt[];

  isCompleted: (id: ChallengeId) => boolean;
  challengeFor: (id: ChallengeId) => ChallengeScenario | undefined;
  submit: (challengeId: ChallengeId, optionId: string) => {
    ok: boolean;
    reason?: string;
    attempt?: ChallengeAttempt;
  };
  reset: () => void;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const SEED_CHALLENGES: ChallengeScenario[] = [
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    description: 'An unexpected expense hits your budget.',
    situation:
      'Your phone breaks and repair costs EGP 3,000. You have EGP 1,500 savings and EGP 0 emergency fund.',
    difficulty: 'easy',
    coinReward: 20,
    xpReward: 25,
    options: [
      {
        id: 'save-first',
        label: 'Pay from savings + cut expenses next month',
        impactCoins: 10,
        impactXP: 10,
        impactScore: 25,
        explanation:
          'Good move. You avoided debt. Next step: build a small emergency fund.',
      },
      {
        id: 'credit-card',
        label: 'Put it on a credit card and pay later',
        impactCoins: -5,
        impactXP: 5,
        impactScore: -10,
        explanation:
          'Not ideal. Debt can grow fast. Use credit only if you can pay in full.',
      },
      {
        id: 'borrow-friend',
        label: 'Borrow from a friend with a clear repayment plan',
        impactCoins: 0,
        impactXP: 8,
        impactScore: 10,
        explanation:
          'Better than high interest debt, but always agree on repayment to protect relationships.',
      },
    ],
  },
  {
    id: 'salary-split',
    title: 'Salary Split',
    description: 'Decide how to split your monthly salary.',
    situation:
      'You earn EGP 15,000/month. You want to save, invest, and still enjoy life. What do you do?',
    difficulty: 'easy',
    coinReward: 20,
    xpReward: 25,
    options: [
      {
        id: '50-30-20',
        label: 'Use 50/30/20 rule (needs/wants/savings)',
        impactCoins: 10,
        impactXP: 12,
        impactScore: 25,
        explanation:
          'Solid structure. It’s simple and sustainable for most people.',
      },
      {
        id: 'save-70',
        label: 'Save 70% and live very tight',
        impactCoins: 5,
        impactXP: 10,
        impactScore: 5,
        explanation:
          'Saving is good, but too strict can lead to burnout and quitting.',
      },
      {
        id: 'spend-now',
        label: 'Spend now and “save later”',
        impactCoins: -10,
        impactXP: 0,
        impactScore: -25,
        explanation:
          'This is how people stay broke. Pay yourself first, even if small.',
      },
    ],
  },
  {
    id: 'credit-mistake',
    title: 'Credit Score Mistake',
    description: 'A payment is due and cash is tight.',
    situation:
      'Your credit card minimum payment is due tomorrow. You’re short EGP 500.',
    difficulty: 'medium',
    coinReward: 30,
    xpReward: 35,
    options: [
      {
        id: 'sell-something',
        label: 'Sell something small / do a quick gig for EGP 500',
        impactCoins: 15,
        impactXP: 15,
        impactScore: 20,
        explanation:
          'Great. On-time payments matter. Find a quick cash solution.',
      },
      {
        id: 'miss-payment',
        label: 'Skip it and pay next month',
        impactCoins: -15,
        impactXP: 5,
        impactScore: -30,
        explanation:
          'Missing payments hurts your score and adds fees. Avoid if possible.',
      },
      {
        id: 'borrow-short',
        label: 'Borrow EGP 500 for a week and pay on time',
        impactCoins: 0,
        impactXP: 10,
        impactScore: 10,
        explanation:
          'Not perfect, but it protects your credit history.',
      },
    ],
  },
  {
    id: 'installment-trap',
    title: 'Installment Trap',
    description: 'A tempting offer appears.',
    situation:
      'A store offers a “0% installment” phone for 24 months. Your income is EGP 12,000 and you already have 2 installments.',
    difficulty: 'medium',
    coinReward: 30,
    xpReward: 35,
    options: [
      {
        id: 'wait-cash',
        label: 'Wait and save cash first',
        impactCoins: 12,
        impactXP: 12,
        impactScore: 20,
        explanation:
          'Best. Even 0% can hurt cashflow. Reduce commitments before adding more.',
      },
      {
        id: 'take-it',
        label: 'Take it now (0% sounds great)',
        impactCoins: -8,
        impactXP: 8,
        impactScore: -15,
        explanation:
          'Risky. More installments reduce flexibility and increase stress.',
      },
      {
        id: 'cheaper-model',
        label: 'Buy a cheaper model with fewer months',
        impactCoins: 5,
        impactXP: 10,
        impactScore: 8,
        explanation:
          'Good compromise. Lower total commitment is safer.',
      },
    ],
  },
  {
    id: 'stock-panic',
    title: 'Stock Panic',
    description: 'The market drops suddenly.',
    situation:
      'A stock you bought drops 12% in one day after scary news. What do you do?',
    difficulty: 'hard',
    coinReward: 40,
    xpReward: 45,
    options: [
      {
        id: 'panic-sell',
        label: 'Sell everything immediately',
        impactCoins: -15,
        impactXP: 5,
        impactScore: -30,
        explanation:
          'Panic selling locks losses. Better to follow a plan and risk limits.',
      },
      {
        id: 'review-plan',
        label: 'Review the fundamentals + set a stop-loss plan',
        impactCoins: 15,
        impactXP: 18,
        impactScore: 25,
        explanation:
          'Great. Make decisions based on information, not emotions.',
      },
      {
        id: 'average-down',
        label: 'Buy more immediately to average down',
        impactCoins: 0,
        impactXP: 10,
        impactScore: 0,
        explanation:
          'Sometimes okay, but dangerous without analysis and risk control.',
      },
    ],
  },
  {
    id: 'gold-or-cash',
    title: 'Gold or Cash?',
    description: 'Choose how to store value.',
    situation:
      'You have EGP 20,000 savings. Inflation is rising. How do you protect your money?',
    difficulty: 'medium',
    coinReward: 30,
    xpReward: 35,
    options: [
      {
        id: 'mix',
        label: 'Split: some cash + some gold + small investments',
        impactCoins: 12,
        impactXP: 12,
        impactScore: 20,
        explanation:
          'Best. Diversification protects you from one bad outcome.',
      },
      {
        id: 'all-cash',
        label: 'Keep everything in cash',
        impactCoins: -5,
        impactXP: 5,
        impactScore: -10,
        explanation:
          'Cash loses value with inflation. Keep some, but not all.',
      },
      {
        id: 'all-gold',
        label: 'Put everything in gold',
        impactCoins: 0,
        impactXP: 8,
        impactScore: 5,
        explanation:
          'Gold can hedge inflation, but putting everything in one asset is risky.',
      },
    ],
  },
];

export const useChallengesStore = create<ChallengesState>()(
  persist(
    (set, get) => ({
      challenges: SEED_CHALLENGES,
      completed: [],
      attempts: [],

      isCompleted: (id) => get().completed.includes(id),
      challengeFor: (id) => get().challenges.find((c) => c.id === id),

      submit: (challengeId, optionId) => {
        const challenge = get().challengeFor(challengeId);
        if (!challenge) return { ok: false, reason: 'Unknown challenge' };
        if (get().completed.includes(challengeId)) {
          return { ok: false, reason: 'Already completed' };
        }
        const option = challenge.options.find((o) => o.id === optionId);
        if (!option) return { ok: false, reason: 'Invalid option' };

        const attempt: ChallengeAttempt = {
          id: makeId('att'),
          challengeId,
          optionId,
          scoreDelta: option.impactScore,
          coinsDelta: option.impactCoins + challenge.coinReward,
          xpDelta: option.impactXP + challenge.xpReward,
          at: Date.now(),
        };

        set((state) => ({
          completed: [...state.completed, challengeId],
          attempts: [attempt, ...state.attempts].slice(0, 200),
        }));

        const user = useUserStore.getState();
        const baseReward = rewardFor('lesson_complete');
        // Use impacts + a small base to keep consistent economy.
        user.addCoins(
          attempt.coinsDelta + Math.round(baseReward.coins / 10),
          'lesson_complete'
        );
        user.addXP(attempt.xpDelta + Math.round(baseReward.xp / 10));

        const userId = user.remoteUserId;
        if (userId) {
          void upsertProgress(userId, 'simulation', `challenge:${challengeId}`, 100, true);
        }

        return { ok: true, attempt };
      },

      reset: () =>
        set({
          completed: [],
          attempts: [],
        }),
    }),
    {
      name: 'fin-game/challenges',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        completed: state.completed,
        attempts: state.attempts,
      }),
    }
  )
);

