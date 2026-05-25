import type { SavingsGoal, Transaction } from '@/stores/useBankingStore';
import type { CreditAction } from '@/stores/useCreditStore';
import type { MetalHolding, MetalTrade } from '@/stores/useGoldStore';
import type { Holding, TradeEntry } from '@/stores/useInvestmentStore';
import type { Course, Lesson, Quiz } from '@/stores/useContentStore';

export type SimulationModuleId =
  | 'banking'
  | 'investment'
  | 'gold'
  | 'business'
  | 'challenges'
  | 'finance'
  | 'credit';

export interface LessonProgressSummary {
  totalLessons: number;
  completedLessons: number;
  percent: number;
  coinsEarned: number;
}

export interface SimulationModuleProgress {
  progress: number;
  points: number;
}

export function computeLessonProgress(
  courses: Course[],
  lessons: Lesson[],
  completedLessonIds: string[]
): LessonProgressSummary {
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;
  const percent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const coinsEarned = courses.reduce((sum, course) => {
    const cl = lessons.filter((l) => l.courseId === course.id);
    if (cl.length === 0) return sum;
    const done = cl.every((l) => completedLessonIds.includes(l.id));
    return done ? sum + course.coinReward : sum;
  }, 0);
  return { totalLessons, completedLessons, percent, coinsEarned };
}

export function countCompletedCourses(
  courses: Course[],
  lessonsFor: (courseId: string) => Lesson[],
  completedLessons: string[]
): number {
  let n = 0;
  for (const c of courses) {
    const courseLessons = lessonsFor(c.id);
    if (!courseLessons.length) continue;
    const done = courseLessons.filter((l) => completedLessons.includes(l.id))
      .length;
    if (done === courseLessons.length) n += 1;
  }
  return n;
}

/** Mean best score (0–100) across quizzes with attempts or a passing completion. */
export function averageQuizPercent(
  quizzes: Quiz[],
  quizBestPercent: Record<string, number>,
  completedQuizIds: string[] = []
): number {
  if (!quizzes.length) return 0;
  const completed = new Set(completedQuizIds);
  let sum = 0;
  let n = 0;
  for (const q of quizzes) {
    const fromAttempt = quizBestPercent[q.id];
    if (fromAttempt !== undefined) {
      sum += Math.min(100, Math.max(0, fromAttempt));
      n += 1;
      continue;
    }
    if (completed.has(q.id)) {
      sum += 100;
      n += 1;
    }
  }
  return n ? Math.round(sum / n) : 0;
}

function avgGoalProgress(goals: Pick<SavingsGoal, 'currentAmount' | 'targetAmount'>[]): number {
  if (!goals.length) return 0;
  const sum = goals.reduce((acc, g) => {
    if (g.targetAmount <= 0) return acc;
    return acc + Math.min(100, (g.currentAmount / g.targetAmount) * 100);
  }, 0);
  return sum / goals.length;
}

function bankingProgress(
  goals: SavingsGoal[],
  transactions: Transaction[]
): number {
  const goalPct = avgGoalProgress(goals);
  const txnPct = Math.min(40, transactions.length * 4);
  if (!goals.length && !transactions.length) return 0;
  return Math.min(100, Math.round(goalPct * 0.6 + txnPct));
}

function investmentProgress(trades: TradeEntry[], holdings: Holding[]): number {
  const hasHoldings = holdings.some((h) => h.shares > 0);
  if (!trades.length && !hasHoldings) return 0;
  return Math.min(100, 30 + trades.length * 15 + (hasHoldings ? 25 : 0));
}

function goldProgress(trades: MetalTrade[], holdings: MetalHolding[]): number {
  const hasHoldings = holdings.some((h) => h.grams > 0);
  if (!trades.length && !hasHoldings) return 0;
  return Math.min(100, 20 + trades.length * 20 + (hasHoldings ? 30 : 0));
}

function businessProgress(steps: { completed: boolean }[]): number {
  if (!steps.length) return 0;
  const done = steps.filter((s) => s.completed).length;
  return Math.round((done / steps.length) * 100);
}

function challengesProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(completed, total) / total) * 100);
}

function creditProgress(actions: CreditAction[]): number {
  if (!actions.length) return 0;
  return Math.min(100, actions.length * 12);
}

/** Hub display points scale with module progress (0–~600 at 100%). */
export function simulationPointsFromProgress(progress: number): number {
  return Math.round(Math.min(100, Math.max(0, progress)) * 6);
}

export function computeSimulationModuleProgress(
  id: SimulationModuleId,
  input: {
    bankingGoals: SavingsGoal[];
    bankingTransactions: Transaction[];
    investmentTrades: TradeEntry[];
    investmentHoldings: Holding[];
    goldTrades: MetalTrade[];
    goldHoldings: MetalHolding[];
    businessSteps: { completed: boolean }[];
    challengesCompleted: number;
    challengesTotal: number;
    creditActions: CreditAction[];
  }
): SimulationModuleProgress {
  let progress = 0;
  switch (id) {
    case 'banking':
      progress = bankingProgress(input.bankingGoals, input.bankingTransactions);
      break;
    case 'finance':
      progress = Math.round(avgGoalProgress(input.bankingGoals));
      break;
    case 'investment':
      progress = investmentProgress(
        input.investmentTrades,
        input.investmentHoldings
      );
      break;
    case 'gold':
      progress = goldProgress(input.goldTrades, input.goldHoldings);
      break;
    case 'business':
      progress = businessProgress(input.businessSteps);
      break;
    case 'challenges':
      progress = challengesProgress(
        input.challengesCompleted,
        input.challengesTotal
      );
      break;
    case 'credit':
      progress = creditProgress(input.creditActions);
      break;
    default:
      progress = 0;
  }
  return {
    progress,
    points: simulationPointsFromProgress(progress),
  };
}

const HUB_MODULE_IDS: SimulationModuleId[] = [
  'banking',
  'investment',
  'gold',
  'business',
  'challenges',
  'finance',
  'credit',
];

/** Average progress across all simulation hub modules (matches hub cards). */
export function overallSimulationPercent(
  byModule: Record<SimulationModuleId, SimulationModuleProgress>
): number {
  if (!HUB_MODULE_IDS.length) return 0;
  const sum = HUB_MODULE_IDS.reduce((acc, id) => acc + byModule[id].progress, 0);
  return Math.round(sum / HUB_MODULE_IDS.length);
}

export function buildSimulationProgressMap(input: {
  bankingGoals: SavingsGoal[];
  bankingTransactions: Transaction[];
  investmentTrades: TradeEntry[];
  investmentHoldings: Holding[];
  goldTrades: MetalTrade[];
  goldHoldings: MetalHolding[];
  businessSteps: { completed: boolean }[];
  challengesCompleted: number;
  challengesTotal: number;
  creditActions: CreditAction[];
}): Record<SimulationModuleId, SimulationModuleProgress> {
  const map = {} as Record<SimulationModuleId, SimulationModuleProgress>;
  for (const id of HUB_MODULE_IDS) {
    map[id] = computeSimulationModuleProgress(id, input);
  }
  return map;
}
