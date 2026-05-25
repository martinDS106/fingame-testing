import type { Locale } from '@/lib/i18n';

const STOCK_AR: Record<
  string,
  { name: string; sector: string }
> = {
  COMI: { name: 'البنك التجاري الدولي', sector: 'بنوك' },
  ETEL: { name: 'المصرية للاتصالات', sector: 'اتصالات' },
  HRHO: { name: 'إي اف جي هيرميس', sector: 'بنوك' },
  TMGH: { name: 'مجموعة طلعت مصطفى', sector: 'استهلاك' },
  SWDY: { name: 'السويدي إلكتريك', sector: 'صناعة' },
};

const SECTOR_AR: Record<string, string> = {
  Banking: 'بنوك',
  Telecom: 'اتصالات',
  Industrial: 'صناعة',
  Consumer: 'استهلاك',
  Energy: 'طاقة',
};

export function localizeStockName(
  symbol: string,
  enName: string,
  locale: Locale
): string {
  if (locale !== 'ar') return enName;
  return STOCK_AR[symbol]?.name ?? enName;
}

export function localizeStockSector(
  sector: string,
  locale: Locale
): string {
  if (locale !== 'ar') return sector;
  return SECTOR_AR[sector] ?? sector;
}
