import {
  useAppNotifyStore,
  type AppNotifyVariant,
} from '@/stores/useAppNotifyStore';

export function showAppNotify(input: {
  variant?: AppNotifyVariant;
  title: string;
  message: string;
  durationMs?: number;
  onDismiss?: () => void;
}): void {
  useAppNotifyStore.getState().show({
    variant: input.variant ?? 'info',
    title: input.title,
    message: input.message,
    onDismiss: input.onDismiss,
  });
}

export function dismissAppNotify(): void {
  useAppNotifyStore.getState().dismiss();
}
