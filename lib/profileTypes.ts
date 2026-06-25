export type Gender = 'male' | 'female' | 'other';
export type UserType = 'student' | 'employed' | 'both';
export type IncomeRange = 'lt_3000' | '3000_5000' | '5000_10000' | 'gt_10000';
export type FinancialGoal = 'saving' | 'investing' | 'learning' | 'business';
export type FinancialLiteracy = 'beginner' | 'intermediate' | 'advanced';

export { AVATAR_PRESETS, DEFAULT_AVATAR_ID, type AvatarPresetId } from '@/lib/avatarPresets';

export const GENDER_OPTIONS: Gender[] = ['male', 'female', 'other'];
export const USER_TYPE_OPTIONS: UserType[] = ['student', 'employed', 'both'];
export const INCOME_RANGE_OPTIONS: IncomeRange[] = [
  'lt_3000',
  '3000_5000',
  '5000_10000',
  'gt_10000',
];
export const FINANCIAL_GOAL_OPTIONS: FinancialGoal[] = [
  'saving',
  'investing',
  'learning',
  'business',
];
export const FINANCIAL_LITERACY_OPTIONS: FinancialLiteracy[] = [
  'beginner',
  'intermediate',
  'advanced',
];

export interface ExtendedProfileFields {
  dateOfBirth: string | null;
  gender: Gender | null;
  mobile: string;
  governorate: string;
  city: string;
  userType: UserType | null;
  schoolName: string;
  facultyMajor: string;
  academicYear: string;
  employer: string;
  monthlyIncomeRange: IncomeRange | null;
  financialGoals: FinancialGoal[];
  financialLiteracy: FinancialLiteracy | null;
  persona: string | null;
  parentEmail: string;
  parentPhone: string;
  referralCode: string;
  referredByCode: string;
  profileCompletedAt: string | null;
}

export const EMPTY_EXTENDED_PROFILE: ExtendedProfileFields = {
  dateOfBirth: null,
  gender: null,
  mobile: '',
  governorate: '',
  city: '',
  userType: null,
  schoolName: '',
  facultyMajor: '',
  academicYear: '',
  employer: '',
  monthlyIncomeRange: null,
  financialGoals: [],
  financialLiteracy: null,
  persona: null,
  parentEmail: '',
  parentPhone: '',
  referralCode: '',
  referredByCode: '',
  profileCompletedAt: null,
};

export function parseFinancialGoals(raw: unknown): FinancialGoal[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((g): g is FinancialGoal =>
      FINANCIAL_GOAL_OPTIONS.includes(g as FinancialGoal),
    );
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parseFinancialGoals(parsed);
    } catch {
      return [];
    }
  }
  return [];
}
