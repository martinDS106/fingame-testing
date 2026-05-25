import { useEffect, useRef } from 'react';

import { useUserStore } from '@/stores';

export interface CheckInResult {
  awarded: boolean;
  coins: number;
  newStreak: number;
}

const DAILY_LOGIN_COINS = 10;
const DAILY_LOGIN_XP = 15;

/** Run once per app session — awards daily coins/XP when the calendar day changes. */
export async function performDailyCheckIn(): Promise<CheckInResult> {
  const { newStreak, streakChanged } = await useUserStore.getState().checkInDaily();
  if (!streakChanged) {
    return { awarded: false, coins: 0, newStreak };
  }
  const addCoins = useUserStore.getState().addCoins;
  const addXP = useUserStore.getState().addXP;
  await addCoins(DAILY_LOGIN_COINS, 'daily_login');
  await addXP(DAILY_LOGIN_XP);
  return {
    awarded: true,
    coins: DAILY_LOGIN_COINS,
    newStreak,
  };
}

export function useDailyCheckIn(
  onReward?: (result: CheckInResult) => void
): void {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void performDailyCheckIn().then((result) => {
      onReward?.(result);
    });
  }, [onReward]);
}
