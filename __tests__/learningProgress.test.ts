import {
  averageQuizPercent,
  buildSimulationProgressMap,
  computeLessonProgress,
  overallSimulationPercent,
} from '@/lib/learningProgress';

describe('learningProgress', () => {
  it('computes lesson percent like courses screen', () => {
    const courses = [{ id: 'c1', coinReward: 100 } as never];
    const lessons = [
      { id: 'l1', courseId: 'c1' },
      { id: 'l2', courseId: 'c1' },
    ] as never[];
    const r = computeLessonProgress(courses, lessons, ['l1']);
    expect(r.completedLessons).toBe(1);
    expect(r.totalLessons).toBe(2);
    expect(r.percent).toBe(50);
  });

  it('counts completed quizzes in quiz average', () => {
    const quizzes = [{ id: 'q1' }, { id: 'q2' }] as never[];
    expect(averageQuizPercent(quizzes, {}, ['q1'])).toBe(50);
    expect(averageQuizPercent(quizzes, { q1: 80 }, ['q2'])).toBe(90);
  });

  it('averages simulation hub modules', () => {
    const map = buildSimulationProgressMap({
      bankingGoals: [],
      bankingTransactions: [],
      investmentTrades: [],
      investmentHoldings: [],
      goldTrades: [],
      goldHoldings: [],
      businessSteps: [{ completed: true }, { completed: false }],
      challengesCompleted: 1,
      challengesTotal: 4,
      creditActions: [],
    });
    expect(map.business.progress).toBe(50);
    expect(overallSimulationPercent(map)).toBeGreaterThan(0);
  });
});
