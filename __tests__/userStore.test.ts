import { useUserStore, xpProgressToNextLevel } from '@/stores/useUserStore';

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      profile: { name: 'Player', email: '', avatar: '👤', level: 'Beginner' },
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
});

