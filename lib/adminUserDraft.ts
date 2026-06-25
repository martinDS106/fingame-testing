import type { RemoteProfile } from '@/lib/syncServiceApi';
import type { UserLevel } from '@/stores/useUserStore';

export type AdminUserDraft = {
  displayName: string;
  avatar: string;
  level: string;
  coins: string;
  xp: string;
  streak: string;
  longestStreak: string;
  isAdmin: boolean;
  mobile: string;
  governorate: string;
  city: string;
  gender: string;
  dateOfBirth: string;
  userType: string;
  schoolName: string;
  facultyMajor: string;
  academicYear: string;
  employer: string;
  monthlyIncomeRange: string;
  financialGoals: string;
  financialLiteracy: string;
  persona: string;
  parentEmail: string;
  parentPhone: string;
  referredByCode: string;
  referralOnboardingPending: boolean;
};

export type AdminUserProfilePatch = Partial<{
  display_name: string;
  avatar: string;
  level: UserLevel;
  coins: number;
  xp: number;
  streak: number;
  longest_streak: number;
  is_admin: boolean;
  mobile: string | null;
  governorate: string | null;
  city: string | null;
  gender: string | null;
  date_of_birth: string | null;
  user_type: string | null;
  school_name: string | null;
  faculty_major: string | null;
  academic_year: string | null;
  employer: string | null;
  monthly_income_range: string | null;
  financial_goals: string[];
  financial_literacy: string | null;
  persona: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  referred_by_code: string | null;
  referral_onboarding_pending: boolean;
}>;

function safeInt(v: string, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function nullIfEmpty(v: string): string | null {
  const s = v.trim();
  return s ? s : null;
}

export function remoteProfileToAdminDraft(u: RemoteProfile): AdminUserDraft {
  return {
    displayName: u.display_name ?? '',
    avatar: u.avatar ?? 'default',
    level: u.level ?? 'Beginner',
    coins: String(u.coins ?? 0),
    xp: String(u.xp ?? 0),
    streak: String(u.streak ?? 0),
    longestStreak: String(u.longest_streak ?? 0),
    isAdmin: !!u.is_admin,
    mobile: u.mobile ?? '',
    governorate: u.governorate ?? '',
    city: u.city ?? '',
    gender: u.gender ?? '',
    dateOfBirth: u.date_of_birth ?? '',
    userType: u.user_type ?? '',
    schoolName: u.school_name ?? '',
    facultyMajor: u.faculty_major ?? '',
    academicYear: u.academic_year ?? '',
    employer: u.employer ?? '',
    monthlyIncomeRange: u.monthly_income_range ?? '',
    financialGoals: u.financial_goals?.join(', ') ?? '',
    financialLiteracy: u.financial_literacy ?? '',
    persona: u.persona ?? '',
    parentEmail: u.parent_email ?? '',
    parentPhone: u.parent_phone ?? '',
    referredByCode: u.referred_by_code ?? '',
    referralOnboardingPending: !!u.referral_onboarding_pending,
  };
}

export function adminDraftToPatch(draft: AdminUserDraft): AdminUserProfilePatch {
  const goals = draft.financialGoals
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    display_name: draft.displayName.trim() || 'Player',
    avatar: draft.avatar.trim() || 'default',
    level: draft.level as UserLevel,
    coins: safeInt(draft.coins, 0),
    xp: safeInt(draft.xp, 0),
    streak: safeInt(draft.streak, 0),
    longest_streak: safeInt(draft.longestStreak, 0),
    is_admin: draft.isAdmin,
    mobile: nullIfEmpty(draft.mobile),
    governorate: nullIfEmpty(draft.governorate),
    city: nullIfEmpty(draft.city),
    gender: nullIfEmpty(draft.gender),
    date_of_birth: nullIfEmpty(draft.dateOfBirth),
    user_type: nullIfEmpty(draft.userType),
    school_name: nullIfEmpty(draft.schoolName),
    faculty_major: nullIfEmpty(draft.facultyMajor),
    academic_year: nullIfEmpty(draft.academicYear),
    employer: nullIfEmpty(draft.employer),
    monthly_income_range: nullIfEmpty(draft.monthlyIncomeRange),
    financial_goals: goals,
    financial_literacy: nullIfEmpty(draft.financialLiteracy),
    persona: nullIfEmpty(draft.persona),
    parent_email: nullIfEmpty(draft.parentEmail),
    parent_phone: nullIfEmpty(draft.parentPhone),
    referred_by_code: nullIfEmpty(draft.referredByCode),
    referral_onboarding_pending: draft.referralOnboardingPending,
  };
}
