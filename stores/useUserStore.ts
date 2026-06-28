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
  EMPTY_EXTENDED_PROFILE,
  type ExtendedProfileFields,
} from '@/lib/profileTypes';
import { isProfileComplete } from '@/lib/profileCompletion';
import {
  logCoinChange,
  pullProfile,
  pushProfile,
  remoteProfileToLocal,
  fetchApiHealth,
  fetchMyReferralCode,
  applyFriendReferralCode,
  skipReferralOnboarding as skipReferralOnboardingApi,
} from '@/lib/syncServiceApi';

export type UserLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert';

export interface UserProfile extends ExtendedProfileFields {
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
  saveExtendedProfile: () => Promise<{ ok: boolean; error?: string }>;
  hydrate: () => void;

  /** Cloud ↔ local sync */
  bindToUser: (userId: string, email?: string) => Promise<void>;
  unbindFromUser: () => void;
  pushSnapshot: () => Promise<void>;
  refreshMyReferralCode: () => Promise<{ code: string | null; staleApi: boolean }>;
  applyFriendReferral: (code: string) => Promise<{ ok: boolean; coins?: number; error?: string }>;
  skipReferralOnboarding: () => Promise<{ ok: boolean; error?: string }>;
}

const XP_PER_LEVEL = 500;

function computeLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

function profileToApiPayload(
  p: UserProfile,
  extras?: { profile_completed_at?: string | null },
) {
  return {
    display_name: p.name,
    avatar: p.avatar,
    level: p.level,
    date_of_birth: p.dateOfBirth,
    gender: p.gender,
    mobile: p.mobile || null,
    governorate: p.governorate || null,
    city: p.city || null,
    user_type: p.userType,
    school_name: p.schoolName || null,
    faculty_major: p.facultyMajor || null,
    academic_year: p.academicYear || null,
    employer: p.employer || null,
    monthly_income_range: p.monthlyIncomeRange,
    financial_goals: p.financialGoals,
    financial_literacy: p.financialLiteracy,
    persona: p.persona,
    parent_email: p.parentEmail || null,
    parent_phone: p.parentPhone || null,
    profile_completed_at: extras?.profile_completed_at ?? p.profileCompletedAt,
  };
}

const defaultProfile: UserProfile = {
  name: 'Player',
  email: '',
  avatar: 'default',
  avatarImageUri: null,
  level: 'Beginner',
  ...EMPTY_EXTENDED_PROFILE,
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

      hasClaimedReward: (key) => {
        const { remoteUserId } = get();
        const scopedKey = remoteUserId ? `${remoteUserId}:${key}` : key;
        return get().claimedRewards.includes(scopedKey);
      },

      claimRewardOnce: async (key, coins, xp, reason = 'lesson_complete') => {
        if (!key) return false;
        const { remoteUserId } = get();
        const scopedKey = remoteUserId ? `${remoteUserId}:${key}` : key;
        if (get().claimedRewards.includes(scopedKey)) return false;

        const prevClaimed = get().claimedRewards;
        set((state) => ({
          claimedRewards: [...state.claimedRewards, scopedKey].slice(0, 200),
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

      saveExtendedProfile: async () => {
        const { profile, remoteUserId } = get();
        const completedAt = isProfileComplete(profile)
          ? new Date().toISOString()
          : profile.profileCompletedAt;

        if (completedAt && completedAt !== profile.profileCompletedAt) {
          set((state) => ({
            profile: { ...state.profile, profileCompletedAt: completedAt },
          }));
        }

        if (!remoteUserId || !isApiConfigured) {
          return { ok: true };
        }

        const p = get().profile;
        const res = await pushProfile(
          profileToApiPayload(p, { profile_completed_at: completedAt }),
        );
        return res.ok ? { ok: true } : { ok: false, error: res.error };
      },

      hydrate: () => {},

      bindToUser: async (userId, email) => {
        const prevId = get().remoteUserId;
        const accountChanged = prevId !== userId;
        const localStreak = accountChanged
          ? { streak: 0, longestStreak: 0, lastActiveDate: null }
          : {
              streak: get().streak,
              longestStreak: get().longestStreak,
              lastActiveDate: get().lastActiveDate,
            };
        set({
          remoteUserId: userId,
          syncStatus: 'syncing',
          ...(accountChanged ? { claimedRewards: [] } : {}),
        });

        try {
          const remote = await pullProfile(userId);

          if (remote) {
            const merged = remoteProfileToLocal(remote);
            const streakMerged = accountChanged
              ? {
                  streak: merged.streak,
                  longestStreak: merged.longestStreak,
                  lastActiveDate: merged.lastActiveDate,
                }
              : mergeStreakFields(localStreak, {
                  streak: merged.streak,
                  longestStreak: merged.longestStreak,
                  lastActiveDate: merged.lastActiveDate,
                });
            set({
              profile: {
                ...merged.profile,
                email: email ?? merged.profile.email,
                referralOnboardingPending:
                  merged.profile.referralOnboardingPending ||
                  get().profile.referralOnboardingPending,
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
              !accountChanged &&
              (streakMerged.streak !== remoteStreak.streak ||
                streakMerged.longestStreak !== remoteStreak.longestStreak ||
                streakMerged.lastActiveDate !== remoteStreak.lastActiveDate)
            ) {
              void pushProfile({
                streak: streakMerged.streak,
                longest_streak: streakMerged.longestStreak,
                last_active_date: streakMerged.lastActiveDate,
              });
            }
          } else if (!accountChanged) {
            const s = get();
            await pushProfile({
              ...profileToApiPayload(s.profile),
              coins: s.coins,
              xp: s.xp,
              streak: s.streak,
              longest_streak: s.longestStreak,
              last_active_date: s.lastActiveDate,
            });
            set({ syncStatus: 'synced', lastSyncedAt: Date.now() });
          } else {
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
          streak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          claimedRewards: [],
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

      refreshMyReferralCode: async () => {
        const { remoteUserId } = get();
        if (!remoteUserId || !isApiConfigured) {
          return { code: null, staleApi: false };
        }

        const health = await fetchApiHealth();
        const serverOld = health?.ok === true && !health?.referralCodes;

        const remote = await pullProfile(remoteUserId);
        let code = remote?.referral_code?.trim() ?? '';
        if (!code) {
          code = (await fetchMyReferralCode()) ?? '';
        }

        if (code) {
          set((s) => ({
            profile: { ...s.profile, referralCode: code },
          }));
          return { code, staleApi: false };
        }

        return { code: null, staleApi: serverOld || !!remote };
      },

      applyFriendReferral: async (code) => {
        const res = await applyFriendReferralCode(code);
        if (!res.ok) return { ok: false, error: res.error };
        set((s) => ({
          profile: {
            ...s.profile,
            ...res.profile.profile,
            email: s.profile.email || res.profile.profile.email,
          },
          coins: res.profile.coins,
          xp: res.profile.xp,
          level: computeLevel(res.profile.xp),
          streak: res.profile.streak,
          longestStreak: res.profile.longestStreak,
          lastActiveDate: res.profile.lastActiveDate,
          isAdmin: res.profile.isAdmin,
        }));
        return { ok: true, coins: res.inviteeCoins };
      },

      skipReferralOnboarding: async () => {
        const res = await skipReferralOnboardingApi();
        if (!res.ok) return { ok: false, error: res.error };
        set((s) => ({
          profile: {
            ...s.profile,
            ...res.profile.profile,
            referralOnboardingPending: false,
            email: s.profile.email || res.profile.profile.email,
          },
          coins: res.profile.coins,
          xp: res.profile.xp,
          level: computeLevel(res.profile.xp),
        }));
        return { ok: true };
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
        remoteUserId: state.remoteUserId,
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
