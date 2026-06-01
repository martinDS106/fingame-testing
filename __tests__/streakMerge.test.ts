import { localDateStamp } from '@/lib/dateStamp';
import { mergeStreakFields } from '@/lib/streakMerge';

describe('mergeStreakFields', () => {
  test('same day keeps higher streak (cloud stale 1, local 4)', () => {
    const today = localDateStamp();
    const merged = mergeStreakFields(
      { streak: 4, longestStreak: 4, lastActiveDate: today },
      { streak: 1, longestStreak: 4, lastActiveDate: today }
    );
    expect(merged.streak).toBe(4);
    expect(merged.lastActiveDate).toBe(today);
  });

  test('prefers local when local last active is more recent', () => {
    const today = localDateStamp();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = localDateStamp(yesterday);
    const merged = mergeStreakFields(
      { streak: 4, longestStreak: 4, lastActiveDate: today },
      { streak: 1, longestStreak: 1, lastActiveDate: y }
    );
    expect(merged.streak).toBe(4);
    expect(merged.lastActiveDate).toBe(today);
  });
});
