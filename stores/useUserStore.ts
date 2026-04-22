import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { asyncStorage } from './storage';
import {
  logCoinChange,
  pullProfile,
  pushProfile,
  remoteProfileToLocal,
} from '@/lib/syncService';

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

  addCoins: (amount: number, reason: CoinsReason) => void;
  spendCoins: (amount: number, reason?: CoinsReason) => boolean;
  addXP: (amount: number) => void;
  hasClaimedReward: (key: string) => boolean;
  claimRewardOnce: (
    key: string,
    coins: number,
    xp: number,
    reason?: CoinsReason
  ) => boolean;
  checkInDaily: () => { newStreak: number; streakChanged: boolean };
  resetStreak: () => void;
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

function todayStamp(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
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

      addCoins: (amount, reason) => {
        if (amount <= 0) return;
        const entry: CoinsLogEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          amount,
          reason,
          at: Date.now(),
        };
        set((state) => ({
          coins: state.coins + amount,
          coinsLog: [entry, ...state.coinsLog].slice(0, 100),
        }));

        const { remoteUserId } = get();
        if (remoteUserId) {
          logCoinChange(remoteUserId, amount, reason).catch(() => undefined);
          pushProfile(remoteUserId, { coins: get().coins }).catch(
            () => undefined
          );
        }
      },

      spendCoins: (amount, reason = 'manual') => {
        if (amount <= 0) return true;
        const { coins } = get();
        if (coins < amount) return false;
        set({ coins: coins - amount });

        const { remoteUserId } = get();
        if (remoteUserId) {
          logCoinChange(remoteUserId, -amount, reason).catch(() => undefined);
          pushProfile(remoteUserId, { coins: get().coins }).catch(
            () => undefined
          );
        }
        return true;
      },

      addXP: (amount) => {
        if (amount <= 0) return;
        set((state) => {
          const newXP = state.xp + amount;
          return { xp: newXP, level: computeLevel(newXP) };
        });

        const { remoteUserId, xp } = get();
        if (remoteUserId) {
          pushProfile(remoteUserId, { xp }).catch(() => undefined);
        }
      },

      hasClaimedReward: (key) => get().claimedRewards.includes(key),

      claimRewardOnce: (key, coins, xp, reason = 'lesson_complete') => {
        if (!key) return false;
        if (get().claimedRewards.includes(key)) return false;
        set((state) => ({
          claimedRewards: [...state.claimedRewards, key].slice(0, 200),
        }));
        if (coins > 0) get().addCoins(coins, reason);
        if (xp > 0) get().addXP(xp);
        return true;
      },

      checkInDaily: () => {
        const today = todayStamp();
        const state = get();
        const last = state.lastActiveDate;

        if (last === today) {
          return { newStreak: state.streak, streakChanged: false };
        }

        let newStreak = 1;
        if (last) {
          const diff = daysBetween(last, today);
          if (diff === 1) newStreak = state.streak + 1;
          else if (diff === 0) newStreak = state.streak;
          else newStreak = 1;
        }

        const newLongest = Math.max(state.longestStreak, newStreak);
        set({
          streak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
        });

        const { remoteUserId } = get();
        if (remoteUserId) {
          pushProfile(remoteUserId, {
            streak: newStreak,
            longest_streak: newLongest,
            last_active_date: today,
          }).catch(() => undefined);
        }

        return { newStreak, streakChanged: true };
      },

      resetStreak: () => {
        set({ streak: 0 });
        const { remoteUserId } = get();
        if (remoteUserId) {
          pushProfile(remoteUserId, { streak: 0 }).catch(() => undefined);
        }
      },

      updateProfile: (patch) => {
        set((state) => ({ profile: { ...state.profile, ...patch } }));

        const { remoteUserId, profile } = get();
        if (remoteUserId) {
          pushProfile(remoteUserId, {
            display_name: profile.name,
            avatar: profile.avatar,
            level: profile.level,
          }).catch(() => undefined);
        }
      },

      hydrate: () => {},

      bindToUser: async (userId, email) => {
        const prevId = get().remoteUserId;
        set({ remoteUserId: userId, syncStatus: 'syncing' });

        try {
          const remote = await pullProfile(userId);

          if (remote) {
            const merged = remoteProfileToLocal(remote);
            set({
              profile: {
                ...merged.profile,
                email: email ?? merged.profile.email,
              },
              coins: merged.coins,
              xp: merged.xp,
              level: computeLevel(merged.xp),
              streak: merged.streak,
              longestStreak: merged.longestStreak,
              lastActiveDate: merged.lastActiveDate,
              isAdmin: merged.isAdmin,
              syncStatus: 'synced',
              lastSyncedAt: Date.now(),
            });
          } else {
            const s = get();
            await pushProfile(userId, {
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
        const ok = await pushProfile(s.remoteUserId, {
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
          syncStatus: ok ? 'synced' : 'error',
          lastSyncedAt: ok ? Date.now() : s.lastSyncedAt,
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
