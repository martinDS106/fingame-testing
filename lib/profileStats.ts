import type { ChallengeId } from '@/stores/useChallengesStore';
import type { Course, Lesson, Quiz } from '@/stores/useContentStore';

export {
  averageQuizPercent,
  countCompletedCourses,
  computeLessonProgress,
} from '@/lib/learningProgress';

export interface ProfileAchievement {
  id: number;
  title: string;
  icon: string;
  earned: boolean;
}

export function buildProfileAchievements(input: {
  completedCourses: number;
  completedQuizIds: string[];
  quizBestPercent: Record<string, number>;
  challengesCompleted: ChallengeId[];
  streak: number;
  level: number;
}): ProfileAchievement[] {
  const {
    completedCourses,
    completedQuizIds,
    quizBestPercent,
    challengesCompleted,
    streak,
    level,
  } = input;

  const quizSet = new Set(completedQuizIds);
  const hasPerfectQuiz = Object.values(quizBestPercent).some((p) => p >= 99.5);
  const tradingPro =
    quizSet.has('quiz-egx') ||
    quizSet.has('quiz-investing') ||
    challengesCompleted.includes('stock-panic');

  return [
    {
      id: 1,
      title: 'First Course',
      icon: '🎓',
      earned: completedCourses >= 1,
    },
    {
      id: 2,
      title: 'Quiz Master',
      icon: '🏆',
      earned: completedQuizIds.length >= 3,
    },
    {
      id: 3,
      title: 'Trading Pro',
      icon: '📈',
      earned: tradingPro,
    },
    {
      id: 4,
      title: 'Streak King',
      icon: '🔥',
      earned: streak >= 7,
    },
    {
      id: 5,
      title: 'Top 10',
      icon: '⭐',
      earned: level >= 5,
    },
    {
      id: 6,
      title: 'Perfect Score',
      icon: '💯',
      earned: hasPerfectQuiz,
    },
  ];
}
