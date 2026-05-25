import { useMemo } from 'react';

import {
  averageQuizPercent,
  buildSimulationProgressMap,
  computeLessonProgress,
  countCompletedCourses,
  overallSimulationPercent,
  type SimulationModuleId,
} from '@/lib/learningProgress';
import {
  useBankingStore,
  useBusinessStore,
  useChallengesStore,
  useContentStore,
  useCreditStore,
  useGoldStore,
  useInvestmentStore,
} from '@/stores';

/** Shared course / quiz / simulation metrics for profile, courses, and simulation hub. */
export function useLearningProgress() {
  const courses = useContentStore((s) => s.courses);
  const lessons = useContentStore((s) => s.lessons);
  const completedLessons = useContentStore((s) => s.completedLessons);
  const completedQuizzes = useContentStore((s) => s.completedQuizzes);
  const quizBestPercent = useContentStore((s) => s.quizBestPercent);
  const quizzes = useContentStore((s) => s.quizzes);

  const bankingGoals = useBankingStore((s) => s.goals);
  const bankingTransactions = useBankingStore((s) => s.transactions);
  const investmentTrades = useInvestmentStore((s) => s.trades);
  const investmentHoldings = useInvestmentStore((s) => s.holdings);
  const goldTrades = useGoldStore((s) => s.trades);
  const goldHoldings = useGoldStore((s) => s.holdings);
  const businessSteps = useBusinessStore((s) => s.steps);
  const challengesCompleted = useChallengesStore((s) => s.completed);
  const challenges = useChallengesStore((s) => s.challenges);
  const creditActions = useCreditStore((s) => s.actions);

  return useMemo(() => {
    const lessonsForCourse = (courseId: string) =>
      lessons
        .filter((l) => l.courseId === courseId)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    const lessonProgress = computeLessonProgress(
      courses,
      lessons,
      completedLessons
    );
    const completedCourses = countCompletedCourses(
      courses,
      lessonsForCourse,
      completedLessons
    );
    const quizAverage = averageQuizPercent(
      quizzes,
      quizBestPercent,
      completedQuizzes
    );
    const simulationInput = {
      bankingGoals,
      bankingTransactions,
      investmentTrades,
      investmentHoldings,
      goldTrades,
      goldHoldings,
      businessSteps,
      challengesCompleted: challengesCompleted.length,
      challengesTotal: challenges.length,
      creditActions,
    };
    const simulationByModule = buildSimulationProgressMap(simulationInput);
    const simulationOverall = overallSimulationPercent(simulationByModule);

    return {
      lessonProgress,
      completedCourses,
      totalCourses: courses.length,
      quizAverage,
      simulationByModule,
      simulationOverall,
      simulationFor: (id: SimulationModuleId) => simulationByModule[id],
    };
  }, [
    courses,
    lessons,
    completedLessons,
    completedQuizzes,
    quizBestPercent,
    quizzes,
    bankingGoals,
    bankingTransactions,
    investmentTrades,
    investmentHoldings,
    goldTrades,
    goldHoldings,
    businessSteps,
    challengesCompleted,
    challenges,
    creditActions,
  ]);
}
