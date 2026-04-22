import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/useUserStore';

function syncUserOnAuth(session: Session | null) {
  const userStore = useUserStore.getState();
  if (session?.user) {
    userStore.bindToUser(session.user.id, session.user.email ?? undefined);
  } else {
    userStore.unbindFromUser();
  }
}

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  session: null,
  user: null,
  isOfflineMode: !isSupabaseConfigured,
  error: null,

  init: async () => {
    if (authInitialized) return;
    authInitialized = true;

    if (!isSupabaseConfigured) {
      set({ status: 'guest', isOfflineMode: true });
      return;
    }

    try {
      const { data } = await supabase.auth.getSession();
      set({
        session: data.session,
        user: data.session?.user ?? null,
        status: data.session ? 'authenticated' : 'guest',
      });
      syncUserOnAuth(data.session);

      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          status: session ? 'authenticated' : 'guest',
        });
        syncUserOnAuth(session);
      });
    } catch (err) {
      console.warn('[Auth] init failed', err);
      set({ status: 'guest' });
    }
  },

  signInWithEmail: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase not configured.' };
    }
    set({ error: null });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      set({ error: error.message });
      return { ok: false, error: error.message };
    }
    set({
      session: data.session,
      user: data.user,
      status: 'authenticated',
    });
    syncUserOnAuth(data.session);
    return { ok: true };
  },

  signUpWithEmail: async (email, password, displayName) => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Supabase not configured.' };
    }
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    if (error) {
      set({ error: error.message });
      return { ok: false, error: error.message };
    }
    const needsVerification = !data.session;
    if (data.session) {
      set({
        session: data.session,
        user: data.user,
        status: 'authenticated',
      });
      if (displayName) {
        useUserStore.getState().updateProfile({ name: displayName });
      }
      syncUserOnAuth(data.session);
    }
    return { ok: true, needsVerification };
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => undefined);
    }
    set({ session: null, user: null, status: 'guest' });
    useUserStore.getState().unbindFromUser();
  },

  continueAsGuest: () => {
    set({ status: 'guest', error: null });
  },
}));
