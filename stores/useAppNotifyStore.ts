import { create } from 'zustand';

export type AppNotifyVariant = 'success' | 'reward' | 'course' | 'info';

export type AppNotifyItem = {
  id: string;
  variant: AppNotifyVariant;
  title: string;
  message: string;
  durationMs?: number;
  onDismiss?: () => void;
};

type AppNotifyState = {
  current: AppNotifyItem | null;
  show: (item: Omit<AppNotifyItem, 'id'> & { id?: string }) => void;
  dismiss: () => void;
};

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useAppNotifyStore = create<AppNotifyState>((set, get) => ({
  current: null,

  show: (item) => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    const duration = item.durationMs ?? 4500;
    const next: AppNotifyItem = {
      id: item.id ?? `${Date.now()}`,
      variant: item.variant,
      title: item.title,
      message: item.message,
      durationMs: duration,
      onDismiss: item.onDismiss,
    };

    set({ current: next });

    hideTimer = setTimeout(() => {
      get().dismiss();
    }, duration);
  },

  dismiss: () => {
    const cb = get().current?.onDismiss;
    set({ current: null });
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    cb?.();
  },
}));
