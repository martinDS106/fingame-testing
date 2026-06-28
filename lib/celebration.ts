import { showAppNotify } from '@/lib/appNotify';
import { playCourseCelebrationSound } from '@/lib/playCelebrationSound';
import type { CourseCompletionEvent } from '@/stores/useContentStore';

type CelebrationT = (key: string, params?: Record<string, string | number>) => string;

export async function presentCourseCelebration(
  event: CourseCompletionEvent,
  t: CelebrationT,
): Promise<void> {
  await playCourseCelebrationSound();
  showAppNotify({
    variant: 'course',
    title: t('course.completedTitle'),
    message: event.bonusGranted
      ? t('course.completedBody', { n: event.bonusCoins })
      : t('course.completedAlready'),
    durationMs: 6000,
  });
}

export function presentLessonCelebration(coins: number, t: CelebrationT): void {
  showAppNotify({
    variant: 'reward',
    title: t('lesson.completedTitle'),
    message: t('lesson.completedBody', { n: coins }),
    durationMs: 5000,
  });
}

export function notifySuccess(title: string, message: string): void {
  showAppNotify({ variant: 'success', title, message });
}

export function notifyError(title: string, message: string): void {
  showAppNotify({ variant: 'info', title, message });
}
