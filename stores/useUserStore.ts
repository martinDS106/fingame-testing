import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { asyncStorage } from './storage';
import { isApiConfigured } from '@/lib/api';
import {
  daysBetweenDates,
  localDateStamp,
  normalizeDateStamp,
} from '@/lib/dateStamp';
import { mergeStreakFields } from '@/lib/streakMerge';
import {
  logCoinChange,
  pullProfile,
  pushProfile,
  remoteProfileToLocal,
} from '@/lib/syncServiceApi';

export type UserLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  avatarImageUri?: string | null;
  level: UserLevel;
}

export type CoinsReason =
  | 'daily_login'
  | 'lesson_complete'
  | 'quiz_correct'
  | 'quiz_perfect'
  | 'simulation_win'
  | 'watch_video'
  | 'streak_milestone'
  | 'manual';

interface CoinsLogEntry {
  id: string;
  amount: number;
  reason: CoinsReason;
  at: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface UserState {
  profile: UserProfile;
  coins: number;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  isAdmin: boolean;
  coinsLog: CoinsLogEntry[];
  claimedRewards: string[];

  remoteUserId: string | null;
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;

  addCoins: (amount: number, reason: CoinsReason) => Promise<boolean>;
  spendCoins: (amount: number, reason?: CoinsReason) => Promise<boolean>;
  addXP: (amount: number) => Promise<boolean>;
  hasClaimedReward: (key: string) => boolean;
  claimRewardOnce: (
    key: string,
    coins: number,
    xp: number,
    reason?: CoinsReason
  ) => Promise<boolean>;
  checkInDaily: () => Promise<{ newStreak: number; streakChanged: boolean }>;
  resetStreak: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => void;
  hydrate: () => void;

  /** Cloud ↔ local sync */
  bindToUser: (userId: string, email?: string) => Promise<void>;
  unbindFromUser: () => void;
  pushSnapshot: () => Promise<void>;
}

const XP_PER_LEVEL = 500;

function computeLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

const defaultProfile: UserProfile = {
  name: 'Player',
  email: '',
  avatar: '👤',
  avatarImageUri: null,
  level: 'Beginner',
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
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

      addCoins: async (amount, reason) => {
        if (amount <= 0) return true;
        const entry: CoinsLogEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          amount,
          reason,
          at: Date.now(),
        };

        const prev = get();
        const nextCoins = prev.coins + amount;
        set({
          coins: nextCoins,
          coinsLog: [entry, ...prev.coinsLog].slice(0, 100),
        });

        const { remoteUserId } = get();
        if (!remoteUserId || !isApiConfigured) return true;

        const res = await logCoinChange(amount, reason);
        if (res.ok) return true;

        // Roll back optimistic UI if server rejected the change.
        set({
          coins: prev.coins,
          coinsLog: prev.coinsLog,
        });
        return false;
      },

      spendCoins: async (amount, reason = 'manual') => {
        if (amount <= 0) return true;
        const prev = get();
        if (prev.coins < amount) return false;

        set({ coins: prev.coins - amount });

        const { remoteUserId } = get();
        if (!remoteUserId || !isApiConfigured) return true;

        const res = await logCoinChange(-amount, reason);
        if (res.ok) return true;

        set({ coins: prev.coins });
        return false;
      },

      addXP: async (amount) => {
        if (amount <= 0) return true;
        const prev = get();
        const newXP = prev.xp + amount;
        set({ xp: newXP, level: computeLevel(newXP) });

        const { remoteUserId } = get();
        if (!remoteUserId || !isApiConfigured) return true;

        const res = await pushProfile({ xp: newXP });
        if (res.ok) return true;

        set({ xp: prev.xp, level: computeLevel(prev.xp) });
        return false;
      },

      hasClaimedReward: (key) => get().claimedRewards.includes(key),

      claimRewardOnce: async (key, coins, xp, reason = 'lesson_complete') => {
        if (!key) return false;
        if (get().claimedRewards.includes(key)) return false;

        const prevClaimed = get().claimedRewards;
        set((state) => ({
          claimedRewards: [...state.claimedRewards, key].slice(0, 200),
        }));

        try {
          if (coins > 0) {
            const okCoins = await get().addCoins(coins, reason);
            if (!okCoins) {
              set({ claimedRewards: prevClaimed });
              return false;
            }
          }
          if (xp > 0) {
            const okXp = await get().addXP(xp);
            if (!okXp) {
              // Best-effort rollback: remove coins if we added them.
              if (coins > 0) {
                await get().spendCoins(coins, reason);
              }
              set({ claimedRewards: prevClaimed });
              return false;
            }
          }
          return true;
        } catch {
          set({ claimedRewards: prevClaimed });
          return false;
        }
      },

      checkInDaily: async () => {
        const today = localDateStamp();
        const state = get();
        const last = normalizeDateStamp(state.lastActiveDate);

        if (last === today) {
          return { newStreak: state.streak, streakChanged: false };
        }

        let newStreak = 1;
        if (last) {
          const diff = daysBetweenDates(last, today);
          if (diff === 1) newStreak = state.streak + 1;
          else if (diff === 0) newStreak = state.streak;
          else newStreak = 1;
        }

        const newLongest = Math.max(state.longestStreak, newStreak);
        const prev = get();
        set({
          streak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
        });

        const { remoteUserId } = get();
        if (!remoteUserId || !isApiConfigured) {
          return { newStreak, streakChanged: true };
        }

        const res = await pushProfile({
          streak: newStreak,
          longest_streak: newLongest,
          last_active_date: today,
        });
        if (res.ok) return { newStreak, streakChanged: true };

        // Roll back if server rejected the update.
        set({
          streak: prev.streak,
          longestStreak: prev.longestStreak,
          lastActiveDate: prev.lastActiveDate,
        });
        return { newStreak: prev.streak, streakChanged: false };
      },

      resetStreak: async () => {
        const prev = get();
        set({ streak: 0 });
        const { remoteUserId } = get();
        if (!remoteUserId || !isApiConfigured) return;

        const res = await pushProfile({ streak: 0 });
        if (!res.ok) {
          set({ streak: prev.streak });
        }
      },

      updateProfile: (patch) => {
        set((state) => ({ profile: { ...state.profile, ...patch } }));

        const { remoteUserId, profile } = get();
        if (remoteUserId) {
          void pushProfile({
            display_name: profile.name,
            avatar: profile.avatar,
            level: profile.level,
          });
        }
      },

      hydrate: () => {},

      bindToUser: async (userId, email) => {
        const prevId = get().remoteUserId;
        const localStreak = {
          streak: get().streak,
          longestStreak: get().longestStreak,
          lastActiveDate: get().lastActiveDate,
        };
        set({ remoteUserId: userId, syncStatus: 'syncing' });

        try {
          const remote = await pullProfile(userId);

          if (remote) {
            const merged = remoteProfileToLocal(remote);
            const streakMerged = mergeStreakFields(localStreak, {
              streak: merged.streak,
              longestStreak: merged.longestStreak,
              lastActiveDate: merged.lastActiveDate,
            });
            set({
              profile: {
                ...merged.profile,
                email: email ?? merged.profile.email,
              },
              coins: merged.coins,
              xp: merged.xp,
              level: computeLevel(merged.xp),
              streak: streakMerged.streak,
              longestStreak: streakMerged.longestStreak,
              lastActiveDate: streakMerged.lastActiveDate,
              isAdmin: merged.isAdmin,
              syncStatus: 'synced',
              lastSyncedAt: Date.now(),
            });
            const remoteStreak = {
              streak: merged.streak,
              longestStreak: merged.longestStreak,
              lastActiveDate: merged.lastActiveDate,
            };
            if (
              streakMerged.streak !== remoteStreak.streak ||
              streakMerged.longestStreak !== remoteStreak.longestStreak ||
              streakMerged.lastActiveDate !== remoteStreak.lastActiveDate
            ) {
              void pushProfile({
                streak: streakMerged.streak,
                longest_streak: streakMerged.longestStreak,
                last_active_date: streakMerged.lastActiveDate,
              });
            }
          } else {
            const s = get();
            await pushProfile({
              display_name: s.profile.name,
              avatar: s.profile.avatar,
              level: s.profile.level,
              coins: s.coins,
              xp: s.xp,
              streak: s.streak,
              longest_streak: s.longestStreak,
              last_active_date: s.lastActiveDate,
            });
            set({ syncStatus: 'synced', lastSyncedAt: Date.now() });
          }

          if (email && email !== get().profile.email) {
            set((state) => ({ profile: { ...state.profile, email } }));
          }
        } catch (err) {
          console.warn('[user] bindToUser failed', err);
          set({ syncStatus: 'error' });
        }

        if (prevId && prevId !== userId) {
          console.info('[user] switched cloud user', prevId, '→', userId);
        }

        // Lesson/quiz/video IDs are shared across all users; local persisted progress must
        // match the signed-in account or a new user will appear "already completed".
        try {
          const { useContentStore } = await import('./useContentStore');
          await useContentStore.getState().syncProgressFromServer();
        } catch (e) {
          console.warn('[user] syncProgressFromServer failed', e);
        }
      },

      unbindFromUser: () => {
        set({
          remoteUserId: null,
          syncStatus: 'offline',
          isAdmin: false,
        });
      },

      pushSnapshot: async () => {
        const s = get();
        if (!s.remoteUserId) return;
        set({ syncStatus: 'syncing' });
        const res = await pushProfile({
          display_name: s.profile.name,
          avatar: s.profile.avatar,
          level: s.profile.level,
          coins: s.coins,
          xp: s.xp,
          streak: s.streak,
          longest_streak: s.longestStreak,
          last_active_date: s.lastActiveDate,
        });
        set({
          syncStatus: res.ok ? 'synced' : 'error',
          lastSyncedAt: res.ok ? Date.now() : s.lastSyncedAt,
        });
      },
    }),
    {
      name: 'fin-game/user',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        coins: state.coins,
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
        isAdmin: state.isAdmin,
        coinsLog: state.coinsLog,
        claimedRewards: state.claimedRewards,
      }),
    }
  )
);

export function xpProgressToNextLevel(xp: number): {
  current: number;
  target: number;
  pct: number;
} {
  const current = xp % XP_PER_LEVEL;
  const pct = (current / XP_PER_LEVEL) * 100;
  return { current, target: XP_PER_LEVEL, pct };
}
