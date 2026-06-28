import type { CourseCompletionEvent } from '@/stores/useContentStore';

type PendingCelebration =
  | { kind: 'course'; event: CourseCompletionEvent }
  | { kind: 'lesson'; coins: number };

let pending: PendingCelebration | null = null;

export function queuePendingCelebration(item: PendingCelebration): void {
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
