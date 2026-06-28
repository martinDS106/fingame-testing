import type { CourseCompletionEvent } from '@/stores/useContentStore';

type PendingCelebration =
  | { kind: 'course'; event: CourseCompletionEvent }
  | { kind: 'lesson'; coins: number };

let pending: PendingCelebration | null = null;

export function queuePendingCelebration(item: PendingCelebration): void {
  if (
    pending?.kind === 'course' &&
    item.kind === 'course' &&
    pending.event.bonusGranted &&
    !item.event.bonusGranted
  ) {
    return;
  }
  pending = item;
}

export function takePendingCelebration(): PendingCelebration | null {
  const item = pending;
  pending = null;
  return item;
}

export function hasPendingCelebration(): boolean {
  return pending !== null;
}
