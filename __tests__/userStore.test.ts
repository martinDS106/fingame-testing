import { localDateStamp } from '@/lib/dateStamp';
import { useUserStore, xpProgressToNextLevel } from '@/stores/useUserStore';

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      profile: { name: 'Player', email: '', avatar: 'default', level: 'Beginner' },
      coins: 100,
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      isAdmin: false,
      coinsLog: [],
      claimedRewards: [],
      remoteUserId: null,
      syncStatus: 'idle',
      lastSyncedAt: null,
    } as any);
  });

  test('addCoins increases coins and logs entry', async () => {
    const { addCoins } = useUserStore.getState();
    await addCoins(25, 'manual');
    const s = useUserStore.getState();
    expect(s.coins).toBe(125);
    expect(s.coinsLog.length).toBe(1);
    expect(s.coinsLog[0].amount).toBe(25);
  });

  test('spendCoins returns false if insufficient', async () => {
    const { spendCoins } = useUserStore.getState();
    const ok = await spendCoins(999);
    expect(ok).toBe(false);
    expect(useUserStore.getState().coins).toBe(100);
  });

  test('claimRewardOnce only grants once', async () => {
    const { claimRewardOnce } = useUserStore.getState();
    const first = await claimRewardOnce('reward/x', 10, 25, 'manual');
    const second = await claimRewardOnce('reward/x', 10, 25, 'manual');
    expect(first).toBe(true);
    expect(second).toBe(false);
    const s = useUserStore.getState();
    expect(s.claimedRewards).toContain('reward/x');
    expect(s.coins).toBe(110);
    expect(s.xp).toBe(25);
  });

  test('xpProgressToNextLevel returns pct within 0..100', () => {
    const p = xpProgressToNextLevel(250);
    expect(p.current).toBe(250);
    expect(p.target).toBe(500);
    expect(p.pct).toBeCloseTo(50);
  });

  test('checkInDaily increments streak on consecutive local day', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    useUserStore.setState({
      streak: 4,
      longestStreak: 4,
      lastActiveDate: localDateStamp(yesterday),
      remoteUserId: null,
    } as never);

    const { newStreak, streakChanged } = await useUserStore.getState().checkInDaily();
    expect(streakChanged).toBe(true);
    expect(newStreak).toBe(5);
    expect(useUserStore.getState().lastActiveDate).toBe(localDateStamp());
  });

  test('checkInDaily is idempotent same day', async () => {
    const today = localDateStamp();
    useUserStore.setState({
      streak: 3,
      longestStreak: 3,
      lastActiveDate: today,
      remoteUserId: null,
    } as never);

    const { streakChanged } = await useUserStore.getState().checkInDaily();
    expect(streakChanged).toBe(false);
    expect(useUserStore.getState().streak).toBe(3);
  });
});

