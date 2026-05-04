import { useEffect, useRef } from 'react';

import { useUserStore } from '@/stores';

interface CheckInResult {
  awarded: boolean;
  coins: number;
  newStreak: number;
}

const DAILY_LOGIN_COINS = 10;
const DAILY_LOGIN_XP = 15;

export function useDailyCheckIn(
  onReward?: (result: CheckInResult) => void
): void {
  const ran = useRef(false);
  const checkInDaily = useUserStore((s) => s.checkInDaily);
  const addCoins = useUserStore((s) => s.addCoins);
  const addXP = useUserStore((s) => s.addXP);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      const { newStreak, streakChanged } = await checkInDaily();
      if (streakChanged) {
        await addCoins(DAILY_LOGIN_COINS, 'daily_login');
        await addXP(DAILY_LOGIN_XP);
        onReward?.({
          awarded: true,
          coins: DAILY_LOGIN_COINS,
          newStreak,
        });
      } else {
        onReward?.({ awarded: false, coins: 0, newStreak });
      }
    })();
  }, [checkInDaily, addCoins, addXP, onReward]);
}
