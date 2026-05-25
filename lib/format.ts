import type { Locale } from '@/lib/i18n';

export function formatEGP(amount: number, locale: Locale = 'en'): string {
  const num = amount.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return locale === 'ar' ? `ج.م ${num}` : `EGP ${num}`;
}

export function formatNumber(n: number, locale: Locale = 'en'): string {
  return n.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US');
}
