import type { TxnCategory } from '@/stores';

export interface TxnMeta {
  label: string;
  emoji: string;
  color: string;
}

export const txnMeta: Record<TxnCategory, TxnMeta> = {
  salary: { label: 'Income', emoji: '💰', color: '#16a34a' },
  food: { label: 'Food', emoji: '🛒', color: '#f59e0b' },
  transport: { label: 'Transport', emoji: '🚗', color: '#3b82f6' },
  bills: { label: 'Bills', emoji: '💡', color: '#ef4444' },
  shopping: { label: 'Shopping', emoji: '🛍️', color: '#a855f7' },
  entertainment: { label: 'Entertainment', emoji: '🎬', color: '#ec4899' },
  education: { label: 'Education', emoji: '🎓', color: '#6366f1' },
  savings_transfer: { label: 'Transfer', emoji: '💸', color: '#0ea5e9' },
  other: { label: 'Other', emoji: '📌', color: '#6b7280' },
};

export function metaFor(cat: TxnCategory): TxnMeta {
  return txnMeta[cat] ?? txnMeta.other;
}
