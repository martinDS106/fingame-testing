import { EGYPT_CITIES } from './profileData/cities';
import { EGYPT_EMPLOYERS } from './profileData/employers';
import { ACADEMIC_YEARS, EGYPT_FACULTIES } from './profileData/faculties';
import { EGYPT_SCHOOLS } from './profileData/schools';

export { EGYPT_CITIES, EGYPT_EMPLOYERS, EGYPT_FACULTIES, EGYPT_SCHOOLS, ACADEMIC_YEARS };

export const EGYPT_GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Qalyubia',
  'Sharqia',
  'Dakahlia',
  'Beheira',
  'Gharbia',
  'Monufia',
  'Minya',
  'Assiut',
  'Sohag',
  'Qena',
  'Luxor',
  'Aswan',
  'Red Sea',
  'Fayoum',
  'Beni Suef',
  'Port Said',
  'Suez',
  'Ismailia',
  'Damietta',
  'Kafr El Sheikh',
  'Matrouh',
  'North Sinai',
  'South Sinai',
  'New Valley',
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'القليوبية',
  'الشرقية',
  'الدقهلية',
  'البحيرة',
  'الغربية',
  'المنوفية',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الفيوم',
  'بني سويف',
  'بورسعيد',
  'السويس',
  'الإسماعيلية',
  'دمياط',
  'كفر الشيخ',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
  'الوادي الجديد',
] as const;

function matchScore(query: string, option: string): number {
  const q = query.toLowerCase();
  const o = option.toLowerCase();
  if (!q) return 0;
  if (o === q) return 100;
  if (o.startsWith(q)) return 90;
  const words = o.split(/\s+/);
  if (words.some((w) => w.startsWith(q))) return 75;
  if (o.includes(` ${q}`)) return 65;
  if (o.includes(q)) return 50;
  return 0;
}

export function filterOptions(
  query: string,
  options: readonly string[],
  limit = 20,
): string[] {
  const q = query.trim();
  if (!q) return [];
  const scored = options
    .map((opt) => ({ opt, score: matchScore(q, opt) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.opt.localeCompare(b.opt));
  return scored.slice(0, limit).map((x) => x.opt);
}

export function filterSchools(query: string, limit = 20): string[] {
  return filterOptions(query, EGYPT_SCHOOLS, limit);
}

export function filterGovernorates(query: string, limit = 20): string[] {
  return filterOptions(query, EGYPT_GOVERNORATES, limit);
}

export function filterCities(query: string, limit = 20): string[] {
  return filterOptions(query, EGYPT_CITIES, limit);
}

export function filterEmployers(query: string, limit = 20): string[] {
  return filterOptions(query, EGYPT_EMPLOYERS, limit);
}

export function filterFaculties(query: string, limit = 20): string[] {
  return filterOptions(query, EGYPT_FACULTIES, limit);
}

export function filterAcademicYears(query: string, limit = 20): string[] {
  return filterOptions(query, ACADEMIC_YEARS, limit);
}
