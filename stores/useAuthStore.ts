import { create } from 'zustand';
import {
  apiGetJson,
  apiPostJson,
  bootstrapApiSessionFromRefresh,
  clearPersistedApiAccessToken,
  getApiAccessToken,
  isApiConfigured,
  loadApiTokens,
  persistApiAuthTokens,
  setApiAccessToken,
  setApiRefreshToken,
} from '@/lib/api';
import { useContentStore } from '@/stores/useContentStore';
import { useUserStore } from '@/stores/useUserStore';

type AuthUser = { id: string; email: string };

type ApiAuthUser = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
};

type ApiAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type ApiAuthResponse = {
  user: ApiAuthUser;
  tokens: ApiAuthTokens;
};

type ApiMeResponse = {
  user: { id: string; email: string; isAdmin: boolean } | null;
};

function syncUserOnAuth(userId: string | null, email?: string) {
  const userStore = useUserStore.getState();
  if (userId) {
    userStore.bindToUser(userId, email);
  } else {
    userStore.unbindFromUser();
  }
}

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

interface AuthState {
  status: AuthStatus;
  session: null;
  user: AuthUser | null;
  isOfflineMode: boolean;
  error: string | null;

  init: () => Promise<void>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ ok: boolean; error?: string; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

let authInitialized = false;

export function resetAuthInitialization(): void {
  authInitialized = false;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  user: null,
  isOfflineMode: !isApiConfigured,
  error: null,

  init: async () => {
    if (authInitialized) return;
    authInitialized = true;

    if (!isApiConfigured) {
      set({ status: 'guest', isOfflineMode: true });
      return;
    }

    // Prefer Nest API when configured (no Supabase required).
    if (isApiConfigured) {
      try {
        await loadApiTokens();
        await bootstrapApiSessionFromRefresh();
        const access = getApiAccessToken();
        if (!access) {
          set({
            status: 'guest',
            session: null,
            user: null,
            isOfflineMode: false,
          });
          syncUserOnAuth(null);
          return;
        }

        const me = await apiGetJson<ApiMeResponse>('/me', { auth: true });
        if (!me.user) {
          await clearPersistedApiAccessToken();
          set({
            status: 'guest',
            session: null,
            user: null,
            isOfflineMode: false,
          });
          syncUserOnAuth(null);
          return;
        }

      const syntheticUser: AuthUser = {
        id: me.user.id,
        email: me.user.email,
      };

        set({
          status: 'authenticated',
          session: null,
          user: syntheticUser,
          isOfflineMode: false,
        });
        syncUserOnAuth(me.user.id, me.user.email);
      } catch (err) {
        console.warn('[Auth] API init failed', err);
        await clearPersistedApiAccessToken().catch(() => undefined);
        set({
          status: 'guest',
          session: null,
          user: null,
          isOfflineMode: false,
        });
        syncUserOnAuth(null);
      }
      return;
    }
  },

  signInWithEmail: async (email, password) => {
    set({ error: null });

    if (isApiConfigured) {
    try {
      const res = await apiPostJson<ApiAuthResponse, { email: string; password: string }>(
        '/auth/login',
        { email, password }
      );
      await persistApiAuthTokens(res.tokens.accessToken, res.tokens.refreshToken);
      setApiAccessToken(res.tokens.accessToken);
      setApiRefreshToken(res.tokens.refreshToken);

      const syntheticUser: AuthUser = {
        id: res.user.id,
        email: res.user.email,
      };

      set({
        session: null,
        user: syntheticUser,
        status: 'authenticated',
        isOfflineMode: false,
      });
      resetAuthInitialization();
      syncUserOnAuth(res.user.id, res.user.email);
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      set({ error: msg });
      return { ok: false, error: msg };
    }
    }

    return { ok: false, error: 'Auth not configured.' };
  },

  signUpWithEmail: async (email, password, displayName) => {
    set({ error: null });

    if (isApiConfigured) {
    try {
      const res = await apiPostJson<
        ApiAuthResponse,
        { email: string; password: string; displayName?: string }
      >('/auth/signup', {
        email,
        password,
        ...(displayName ? { displayName } : {}),
      });

      await persistApiAuthTokens(res.tokens.accessToken, res.tokens.refreshToken);
      setApiAccessToken(res.tokens.accessToken);
      setApiRefreshToken(res.tokens.refreshToken);

      const syntheticUser: AuthUser = {
        id: res.user.id,
        email: res.user.email,
      };

      set({
        session: null,
        user: syntheticUser,
        status: 'authenticated',
        isOfflineMode: false,
      });
      resetAuthInitialization();
      if (displayName) {
        useUserStore.getState().updateProfile({ name: displayName });
      }
      syncUserOnAuth(res.user.id, res.user.email);
      return { ok: true, needsVerification: false };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      set({ error: msg });
      return { ok: false, error: msg };
    }
    }

    return { ok: false, error: 'Auth not configured.' };
  },

  signOut: async () => {
    if (isApiConfigured) {
      await clearPersistedApiAccessToken();
      setApiAccessToken(null);
      setApiRefreshToken(null);
    }
    resetAuthInitialization();
    set({ session: null, user: null, status: 'guest' });
    useUserStore.getState().unbindFromUser();
    useContentStore.getState().resetProgressForLogout();
  },

  continueAsGuest: () => {
    set({ status: 'guest', error: null });
  },
}));
