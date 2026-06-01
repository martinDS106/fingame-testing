import {
  daysBetweenDates,
  localDateStamp,
  normalizeDateStamp,
} from '@/lib/dateStamp';

export interface StreakSnapshot {
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

/** Prefer the best streak state when merging local persistence vs cloud profile. */
export function mergeStreakFields(
  local: StreakSnapshot,
  remote: StreakSnapshot
): StreakSnapshot {
  const today = localDateStamp();
  const lLast = normalizeDateStamp(local.lastActiveDate);
  const rLast = normalizeDateStamp(remote.lastActiveDate);

  if (lLast === today && rLast === today) {
    return {
      streak: Math.max(local.streak, remote.streak),
      longestStreak: Math.max(local.longestStreak, remote.longestStreak),
      lastActiveDate: today,
    };
  }

  if (lLast && rLast) {
    const remoteIsOlder = daysBetweenDates(rLast, lLast) > 0;
    if (remoteIsOlder) {
      return {
        streak: local.streak,
        longestStreak: Math.max(local.longestStreak, remote.longestStreak),
        lastActiveDate: lLast,
      };
    }
    const localIsOlder = daysBetweenDates(lLast, rLast) > 0;
    if (localIsOlder) {
      return {
        streak: remote.streak,
        longestStreak: Math.max(local.longestStreak, remote.longestStreak),
        lastActiveDate: rLast,
      };
    }
  }

  if (lLast && !rLast) {
    return {
      streak: local.streak,
      longestStreak: Math.max(local.longestStreak, remote.longestStreak),
      lastActiveDate: lLast,
    };
  }

  if (rLast && !lLast) {
    return {
      streak: remote.streak,
      longestStreak: remote.longestStreak,
      lastActiveDate: rLast,
    };
  }

  return {
    streak: Math.max(local.streak, remote.streak),
    longestStreak: Math.max(local.longestStreak, remote.longestStreak),
    lastActiveDate: lLast ?? rLast,
  };
}
