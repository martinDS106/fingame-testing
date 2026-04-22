import type { CoinsReason } from '@/stores';

export const COINS_REWARDS: Record<CoinsReason, { coins: number; xp: number }> = {
  daily_login: { coins: 10, xp: 15 },
  lesson_complete: { coins: 20, xp: 30 },
  quiz_correct: { coins: 5, xp: 5 },
  quiz_perfect: { coins: 100, xp: 150 },
  simulation_win: { coins: 150, xp: 200 },
  watch_video: { coins: 5, xp: 10 },
  streak_milestone: { coins: 100, xp: 50 },
  manual: { coins: 0, xp: 0 },
};

export function rewardFor(reason: CoinsReason) {
  return COINS_REWARDS[reason];
}
