import { useMemo } from 'react';

import { useLearningProgress } from '@/hooks/useLearningProgress';
import { buildProfileAchievements } from '@/lib/profileStats';
import {
  useChallengesStore,
  useContentStore,
  useUserStore,
} from '@/stores';

/** Live course / quiz / simulation / badge stats for profile and badges screens. */
export function useProfileGamification() {
  const streak = useUserStore((s) => s.streak);
  const level = useUserStore((s) => s.level);
  const completedQuizzes = useContentStore((s) => s.completedQuizzes);
  const quizBestPercent = useContentStore((s) => s.quizBestPercent);
  const challengesCompleted = useChallengesStore((s) => s.completed);
  const learning = useLearningProgress();

  return useMemo(() => {
    const achievements = buildProfileAchievements({
      completedCourses: learning.completedCourses,
      completedQuizIds: completedQuizzes,
      quizBestPercent,
      challengesCompleted,
      streak,
      level,
    });
    const badgesCount = achievements.filter((a) => a.earned).length;
    return {
      completedCourses: learning.completedCourses,
      totalCourses: learning.totalCourses,
      lessonProgress: learning.lessonProgress,
      quizAverage: learning.quizAverage,
      simulationWinRate: learning.simulationOverall,
      achievements,
      badgesCount,
    };
  }, [
    learning.completedCourses,
    learning.totalCourses,
    learning.lessonProgress,
    learning.quizAverage,
    learning.simulationOverall,
    completedQuizzes,
    quizBestPercent,
    challengesCompleted,
    streak,
    level,
  ]);
}
