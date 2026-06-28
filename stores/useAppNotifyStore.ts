import { create } from 'zustand';

export type AppNotifyVariant = 'success' | 'reward' | 'course' | 'info';

export type AppNotifyItem = {
  id: string;
  variant: AppNotifyVariant;
  title: string;
  message: string;
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

    const next: AppNotifyItem = {
      id: item.id ?? `${Date.now()}`,
      variant: item.variant,
      title: item.title,
      message: item.message,
      onDismiss: item.onDismiss,
    };

    set({ current: next });

    hideTimer = setTimeout(() => {
      get().dismiss();
    }, 4500);
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
