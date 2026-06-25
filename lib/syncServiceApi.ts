import {
  apiGetJson,
  apiPatchJson,
  apiPostJson,
  apiRequestJson,
  bootstrapApiSessionFromRefresh,
  getApiAccessToken,
  isApiConfigured,
  loadApiTokens,
} from '@/lib/api';
import { normalizeDateStamp } from '@/lib/dateStamp';
import { parseFinancialGoals } from '@/lib/profileTypes';
import type { CoinsReason, UserLevel, UserProfile } from '@/stores/useUserStore';

// ---------------------------------------------------------------------------
// Shared “remote” shapes (kept compatible with the app’s existing callers)
// ---------------------------------------------------------------------------

export interface RemoteProfile {
  id: string;
  display_name: string;
  avatar: string;
  level: UserLevel;
  is_admin: boolean;
  coins: number;
  xp: number;
  streak: number;
  longest_streak: number;
  last_active_date: string | null;
  date_of_birth: string | null;
  gender: string | null;
  mobile: string | null;
  governorate: string | null;
  city: string | null;
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
  referral_code: string | null;
  referred_by_code: string | null;
  profile_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RemoteCoinsLog {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface RemoteProgress {
  id: string;
  user_id: string;
  kind: 'course' | 'simulation' | 'lesson' | 'quiz' | 'video';
  ref_id: string;
  progress: number;
  completed: boolean;
  updated_at: string;
}

export interface RemoteLeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar: string;
  coins: number;
  xp: number;
  streak: number;
}

export interface RemoteStockPrice {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  updated_at: string;
}

export interface RemoteCourse {
  id: string;
  title: string;
  title_ar: string | null;
  description: string;
  description_ar: string | null;
  topic: string;
  icon: string;
  color: string;
  sort_order: number;
  coin_reward: number;
  created_at: string;
  updated_at: string;
}

export interface RemoteLesson {
  id: string;
  course_id: string;
  title: string;
  title_ar: string | null;
  summary: string | null;
  summary_ar: string | null;
  duration_minutes: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RemoteVideo {
  id: string;
  lesson_id: string;
  title: string;
  title_ar: string | null;
  url: string;
  thumbnail: string | null;
  duration_seconds: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RemoteQuiz {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  coin_reward: number;
  created_at: string;
  updated_at: string;
}

export interface RemoteQuestion {
  id: string;
  quiz_id: string;
  question: string;
  question_ar: string | null;
  options: string[];
  options_ar: string[] | null;
  correct_index: number;
  explanation: string | null;
  explanation_ar: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CourseUpsert = Pick<
  RemoteCourse,
  | 'id'
  | 'title'
  | 'title_ar'
  | 'description'
  | 'description_ar'
  | 'topic'
  | 'icon'
  | 'color'
  | 'sort_order'
  | 'coin_reward'
>;

export type LessonUpsert = Pick<
  RemoteLesson,
  | 'id'
  | 'course_id'
  | 'title'
  | 'title_ar'
  | 'summary'
  | 'summary_ar'
  | 'duration_minutes'
  | 'sort_order'
>;

export type VideoUpsert = Pick<
  RemoteVideo,
  | 'id'
  | 'lesson_id'
  | 'title'
  | 'title_ar'
  | 'url'
  | 'thumbnail'
  | 'duration_seconds'
  | 'sort_order'
>;

export type QuizUpsert = Pick<
  RemoteQuiz,
  | 'id'
  | 'title'
  | 'title_ar'
  | 'description'
  | 'description_ar'
  | 'category'
  | 'difficulty'
  | 'coin_reward'
>;

export type QuestionUpsert = Pick<
  RemoteQuestion,
  | 'id'
  | 'quiz_id'
  | 'question'
  | 'question_ar'
  | 'options'
  | 'options_ar'
  | 'correct_index'
  | 'explanation'
  | 'explanation_ar'
  | 'sort_order'
>;

// ---------------------------------------------------------------------------
// API shapes + mapping helpers
// ---------------------------------------------------------------------------

type ApiUser = {
  id: string;
  email: string;
  isAdmin: boolean;
  displayName: string;
  avatar: string | null;
  level: string;
  coins: number;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  mobile: string | null;
  governorate: string | null;
  city: string | null;
  userType: string | null;
  schoolName: string | null;
  facultyMajor: string | null;
  academicYear: string | null;
  employer: string | null;
  monthlyIncomeRange: string | null;
  financialGoals: string | null;
  financialLiteracy: string | null;
  persona: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  referralCode: string | null;
  referredByCode: string | null;
  profileCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiMeResponse = { user: ApiUser | null };

type ApiCoinsLogRow = {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
};

type ApiProgressRow = {
  id: string;
  userId: string;
  kind: RemoteProgress['kind'];
  refId: string;
  progress: unknown;
  completed: boolean;
  updatedAt: string;
};

type ApiLeaderboardRow = {
  userId: string;
  displayName: string | null;
  avatar: string | null;
  coins: number;
  xp: number;
  streak: number;
};

function apiUserToRemoteProfile(u: ApiUser): RemoteProfile {
  return {
    id: u.id,
    display_name: u.displayName ?? 'Player',
    avatar: u.avatar ?? 'default',
    level: (u.level ?? 'Beginner') as UserLevel,
    is_admin: !!u.isAdmin,
    coins: u.coins ?? 0,
    xp: u.xp ?? 0,
    streak: u.streak ?? 0,
    longest_streak: u.longestStreak ?? 0,
    last_active_date: u.lastActiveDate,
    date_of_birth: u.dateOfBirth,
    gender: u.gender,
    mobile: u.mobile,
    governorate: u.governorate,
    city: u.city,
    user_type: u.userType,
    school_name: u.schoolName,
    faculty_major: u.facultyMajor,
    academic_year: u.academicYear,
    employer: u.employer,
    monthly_income_range: u.monthlyIncomeRange,
    financial_goals: parseFinancialGoals(u.financialGoals),
    financial_literacy: u.financialLiteracy,
    persona: u.persona,
    parent_email: u.parentEmail,
    parent_phone: u.parentPhone,
    referral_code: u.referralCode,
    referred_by_code: u.referredByCode,
    profile_completed_at: u.profileCompletedAt,
    created_at: u.createdAt,
    updated_at: u.updatedAt,
  };
}

function apiProgressToRemote(row: ApiProgressRow): RemoteProgress {
  const p =
    typeof row.progress === 'number'
      ? row.progress
      : Number(row.progress ?? 0);
  return {
    id: row.id,
    user_id: row.userId,
    kind: row.kind,
    ref_id: row.refId,
    progress: Number.isFinite(p) ? p : 0,
    completed: !!row.completed,
    updated_at: row.updatedAt,
  };
}

async function ensureApiAccessTokenLoaded(): Promise<boolean> {
  await loadApiTokens();
  if (getApiAccessToken()) return true;
  return bootstrapApiSessionFromRefresh();
}

function shouldWarnAuthFailure(msg: string): boolean {
  const m = (msg ?? '').toLowerCase();
  // These happen in normal flows (logged out / expired tokens).
  if (m.includes('not authenticated')) return false;
  if (m.includes('session expired')) return false;
  if (m === 'unauthorized') return false;
  return true;
}

// ---------------------------------------------------------------------------
// Profile / coins / progress / leaderboard
// ---------------------------------------------------------------------------

export async function pullProfile(expectedUserId?: string): Promise<RemoteProfile | null> {
  if (!isApiConfigured) return null;
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return null;
  try {
    const res = await apiGetJson<ApiMeResponse>('/me', { auth: true });
    if (!res.user) return null;
    if (expectedUserId && res.user.id !== expectedUserId) return null;
    return apiUserToRemoteProfile(res.user);
  } catch (err) {
    console.warn(
      '[sync] pullProfile (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

export async function fetchApiHealth(): Promise<{
  ok: boolean;
  apiVersion?: string;
  referralCodes?: boolean;
} | null> {
  if (!isApiConfigured) return null;
  try {
    return await apiGetJson('/health', { auth: false });
  } catch {
    return null;
  }
}

export async function fetchMyReferralCode(): Promise<string | null> {
  if (!isApiConfigured) return null;
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return null;
  try {
    const res = await apiGetJson<{ referralCode: string }>('/me/referral-code', {
      auth: true,
    });
    return res.referralCode?.trim() || null;
  } catch {
    return null;
  }
}

export async function pushProfile(
  payload: Partial<{
    display_name: string;
    avatar: string;
    level: UserLevel;
    coins: number;
    xp: number;
    streak: number;
    longest_streak: number;
    last_active_date: string | null;
    date_of_birth: string | null;
    gender: string | null;
    mobile: string | null;
    governorate: string | null;
    city: string | null;
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
    profile_completed_at: string | null;
  }>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };

  try {
    await apiPatchJson(
      '/me',
      {
        displayName: payload.display_name,
        avatar: payload.avatar,
        level: payload.level,
        coins: payload.coins,
        xp: payload.xp,
        streak: payload.streak,
        longestStreak: payload.longest_streak,
        lastActiveDate: payload.last_active_date,
        dateOfBirth: payload.date_of_birth,
        gender: payload.gender,
        mobile: payload.mobile,
        governorate: payload.governorate,
        city: payload.city,
        userType: payload.user_type,
        schoolName: payload.school_name,
        facultyMajor: payload.faculty_major,
        academicYear: payload.academic_year,
        employer: payload.employer,
        monthlyIncomeRange: payload.monthly_income_range,
        financialGoals: payload.financial_goals,
        financialLiteracy: payload.financial_literacy,
        persona: payload.persona,
        parentEmail: payload.parent_email,
        parentPhone: payload.parent_phone,
        referredByCode: payload.referred_by_code,
        profileCompletedAt: payload.profile_completed_at,
      },
      { auth: true },
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (shouldWarnAuthFailure(msg)) console.warn('[sync] pushProfile (API) failed', msg);
    return { ok: false, error: msg };
  }
}

export async function logCoinChange(
  amount: number,
  reason: CoinsReason | string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson(
      '/me/coins',
      { amount, reason: String(reason) },
      { auth: true },
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (shouldWarnAuthFailure(msg)) console.warn('[sync] logCoinChange (API) failed', msg);
    return { ok: false, error: msg };
  }
}

export async function pullCoinsLog(
  limit = 50,
): Promise<RemoteCoinsLog[]> {
  if (!isApiConfigured) return [];
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return [];
  try {
    const rows = await apiGetJson<ApiCoinsLogRow[]>(
      `/me/coins-log?limit=${encodeURIComponent(String(limit))}`,
      { auth: true },
    );
    return (rows ?? []).map((r) => ({
      id: r.id,
      user_id: r.userId,
      amount: r.amount,
      reason: r.reason,
      created_at: r.createdAt,
    }));
  } catch (err) {
    console.warn(
      '[sync] pullCoinsLog (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

export async function upsertProgress(
  _userId: string,
  kind: RemoteProgress['kind'],
  refId: string,
  progress: number,
  completed = false,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson(
      '/progress/upsert',
      {
        kind,
        refId,
        progress,
        completed,
      },
      { auth: true },
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (shouldWarnAuthFailure(msg)) console.warn('[sync] upsertProgress (API) failed', msg);
    return { ok: false, error: msg };
  }
}

export async function pullProgress(
  kind?: RemoteProgress['kind'],
): Promise<RemoteProgress[] | null> {
  if (!isApiConfigured) return null;
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return null;
  try {
    const qs = kind ? `?kind=${encodeURIComponent(kind)}` : '';
    const rows = await apiGetJson<ApiProgressRow[]>(`/progress${qs}`, {
      auth: true,
    });
    return (rows ?? []).map(apiProgressToRemote);
  } catch (err) {
    console.warn(
      '[sync] pullProgress (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

// ---------------------------------------------------------------------------
// Marketplace (not implemented server-side yet) — safe fallback
// ---------------------------------------------------------------------------

export async function pullMarketplaceProducts() {
  return [];
}

export interface RemoteMarketplaceProduct {
  id: string;
  name: string;
  category: string;
  tier: 'strong' | 'moderate' | 'high';
  best_value: boolean;
  created_at: string;
  updated_at: string;
}

export type MarketplaceProductUpsert = Pick<
  RemoteMarketplaceProduct,
  'id' | 'name' | 'category' | 'tier' | 'best_value'
>;

export async function upsertMarketplaceProduct(): Promise<{ ok: false; error: string }> {
  return { ok: false, error: 'Marketplace is not supported in API mode yet.' };
}

export async function deleteMarketplaceProduct(): Promise<{ ok: false; error: string }> {
  return { ok: false, error: 'Marketplace is not supported in API mode yet.' };
}

// ---------------------------------------------------------------------------
// Banking / investments / redemptions (not implemented server-side yet)
// ---------------------------------------------------------------------------

export interface RemoteRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  reward_title: string;
  cost: number;
  status: 'pending' | 'fulfilled' | 'rejected';
  created_at: string;
}

export async function pullRedemptions(): Promise<RemoteRedemption[]> {
  return [];
}

export async function adminPullRedemptions(): Promise<RemoteRedemption[]> {
  return [];
}

export async function adminUpdateRedemptionStatus(): Promise<{ ok: false; error: string }> {
  return { ok: false, error: 'Redemptions are not supported in API mode yet.' };
}

export async function createRedemption(): Promise<{ ok: false; error: string }> {
  return { ok: false, error: 'Redemptions are not supported in API mode yet.' };
}

// (implemented below with real API calls)

// ---------------------------------------------------------------------------
// Simulator persistence (API)
// ---------------------------------------------------------------------------

export async function pullInvestmentPortfolio(): Promise<{
  cash: number;
  holdings: { symbol: string; shares: number; avgCost: number }[];
  trades: {
    id: string;
    symbol: string;
    action: 'buy' | 'sell';
    shares: number;
    price: number;
    orderType?: string;
    at: number;
  }[];
} | null> {
  if (!isApiConfigured) return null;
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return null;
  try {
    return await apiGetJson('/sim/portfolio', { auth: true, timeoutMs: 12000 } as any);
  } catch {
    return null;
  }
}

export async function setInvestmentCash(
  _userId: string,
  cash: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson('/sim/cash', { cash }, { auth: true, timeoutMs: 12000 } as any);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function pushBankingTransaction(
  _userId: string,
  txn: { id: string; accountId: string; amount: number; type: string; category: string; note?: string; at: number },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson('/sim/banking/txns', txn, { auth: true, timeoutMs: 12000 } as any);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function pushInvestmentTrade(
  _userId: string,
  trade: { id: string; symbol: string; action: 'buy' | 'sell'; shares: number; price: number; orderType?: string; at: number },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson('/sim/trades', trade, { auth: true, timeoutMs: 12000 } as any);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function upsertInvestmentHolding(
  _userId: string,
  holding: { symbol: string; shares: number; avgCost: number },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson('/sim/holdings/upsert', holding, { auth: true, timeoutMs: 12000 } as any);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------------------
// FinTok (Supabase storage feature) — disabled in API mode
// ---------------------------------------------------------------------------

export interface RemoteFinTokVideo {
  id: string;
  title: string;
  title_ar?: string | null;
  creator_name?: string;
  creator_name_ar?: string | null;
  creator_avatar?: string;
  caption?: string | null;
  caption_ar?: string | null;
  tags?: string[] | unknown;
  simulation_route?: string | null;
  storage_path: string;
  video_url?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number;
  sort_order?: number;
  is_published?: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface RemoteFinTokComment {
  id: string;
  video_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export async function pullFinTokVideos(): Promise<RemoteFinTokVideo[]> {
  return [];
}

export async function adminPullFinTokVideos(): Promise<RemoteFinTokVideo[]> {
  return [];
}

export async function adminUpsertFinTokVideo(): Promise<{ ok: false; error: string }> {
  return { ok: false, error: 'FinTok is not supported in API mode yet.' };
}

export async function adminDeleteFinTokVideo(): Promise<{ ok: false; error: string }> {
  return { ok: false, error: 'FinTok is not supported in API mode yet.' };
}

export async function pullFinTokLikeIds(): Promise<string[]> {
  return [];
}

export async function pullFinTokSaveIds(): Promise<string[]> {
  return [];
}

export async function pullFinTokComments(): Promise<RemoteFinTokComment[]> {
  return [];
}

export async function setFinTokLike(): Promise<{ ok: false; error: string }> {
  return { ok: false, error: 'FinTok is not supported in API mode yet.' };
}

export async function setFinTokSave(): Promise<{ ok: false; error: string }> {
  return { ok: false, error: 'FinTok is not supported in API mode yet.' };
}

export async function addFinTokComment(): Promise<{ ok: false; error: string }> {
  return { ok: false, error: 'FinTok is not supported in API mode yet.' };
}

export async function pullLeaderboardTop(
  limit = 10,
): Promise<RemoteLeaderboardEntry[]> {
  if (!isApiConfigured) return [];
  try {
    const rows = await apiGetJson<ApiLeaderboardRow[]>(
      `/leaderboard?limit=${encodeURIComponent(String(limit))}`,
    );
    return (rows ?? []).map((r) => ({
      user_id: r.userId,
      display_name: r.displayName ?? 'Player',
      avatar: r.avatar ?? 'default',
      coins: r.coins ?? 0,
      xp: r.xp ?? 0,
      streak: r.streak ?? 0,
    }));
  } catch (err) {
    console.warn(
      '[sync] pullLeaderboardTop (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

export async function recordQuizAttempt(payload: {
  quiz_id: string;
  score: number;
  total: number;
}): Promise<{ ok: true; coinsEarned?: number; xpEarned?: number } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    const res = await apiPostJson<{ coinsEarned: number; xpEarned: number }>(
      `/quizzes/${encodeURIComponent(payload.quiz_id)}/attempt`,
      { score: payload.score, total: payload.total },
      { auth: true },
    );
    return { ok: true, coinsEarned: res.coinsEarned, xpEarned: res.xpEarned };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (shouldWarnAuthFailure(msg)) {
      console.warn('[sync] recordQuizAttempt (API) failed', msg);
    }
    return { ok: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Content (courses / lessons / videos / quizzes / questions)
// ---------------------------------------------------------------------------

type ApiCourse = {
  id: string;
  title: string;
  titleAr: string | null;
  description: string;
  descriptionAr: string | null;
  topic: string;
  icon: string;
  color: string;
  sortOrder: number;
  coinReward: number;
  createdAt: string;
  updatedAt: string;
};

type ApiLesson = {
  id: string;
  courseId: string;
  title: string;
  titleAr: string | null;
  summary: string | null;
  summaryAr: string | null;
  durationMinutes: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ApiVideo = {
  id: string;
  lessonId: string;
  title: string;
  titleAr: string | null;
  url: string;
  thumbnail: string | null;
  durationSeconds: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ApiQuiz = {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  coinReward: number;
  createdAt: string;
  updatedAt: string;
};

type ApiQuestion = {
  id: string;
  quizId: string;
  question: string;
  questionAr: string | null;
  options: string[];
  optionsAr: string[] | null;
  correctIndex: number;
  explanation: string | null;
  explanationAr: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ApiCourseById = ApiCourse & { lessons: (ApiLesson & { videos: ApiVideo[] })[] };
type ApiQuizById = ApiQuiz & { questions: ApiQuestion[] };

function apiCourseToRemote(c: ApiCourse): RemoteCourse {
  return {
    id: c.id,
    title: c.title,
    title_ar: c.titleAr,
    description: c.description,
    description_ar: c.descriptionAr,
    topic: c.topic,
    icon: c.icon,
    color: c.color,
    sort_order: c.sortOrder,
    coin_reward: c.coinReward,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

function apiLessonToRemote(l: ApiLesson): RemoteLesson {
  return {
    id: l.id,
    course_id: l.courseId,
    title: l.title,
    title_ar: l.titleAr,
    summary: l.summary,
    summary_ar: l.summaryAr,
    duration_minutes: l.durationMinutes,
    sort_order: l.sortOrder,
    created_at: l.createdAt,
    updated_at: l.updatedAt,
  };
}

function apiVideoToRemote(v: ApiVideo): RemoteVideo {
  return {
    id: v.id,
    lesson_id: v.lessonId,
    title: v.title,
    title_ar: v.titleAr,
    url: v.url,
    thumbnail: v.thumbnail,
    duration_seconds: v.durationSeconds,
    sort_order: v.sortOrder,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  };
}

function apiQuizToRemote(q: ApiQuiz): RemoteQuiz {
  return {
    id: q.id,
    title: q.title,
    title_ar: q.titleAr,
    description: q.description,
    description_ar: q.descriptionAr,
    category: q.category,
    difficulty: q.difficulty,
    coin_reward: q.coinReward,
    created_at: q.createdAt,
    updated_at: q.updatedAt,
  };
}

function apiQuestionToRemote(q: ApiQuestion): RemoteQuestion {
  return {
    id: q.id,
    quiz_id: q.quizId,
    question: q.question,
    question_ar: q.questionAr,
    options: q.options ?? [],
    options_ar: q.optionsAr ?? null,
    correct_index: q.correctIndex,
    explanation: q.explanation,
    explanation_ar: q.explanationAr,
    sort_order: q.sortOrder,
    created_at: q.createdAt,
    updated_at: q.updatedAt,
  };
}

export async function pullCourses(topic = 'all'): Promise<RemoteCourse[]> {
  if (!isApiConfigured) return [];
  try {
    const qs = topic && topic !== 'all' ? `?topic=${encodeURIComponent(topic)}` : '';
    const rows = await apiGetJson<ApiCourse[]>(`/courses${qs}`, {
      timeoutMs: 60000,
    });
    return (rows ?? []).map(apiCourseToRemote);
  } catch (err) {
    console.warn(
      '[sync] pullCourses (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

export async function pullLessons(): Promise<RemoteLesson[]> {
  if (!isApiConfigured) return [];
  try {
    const courses = await apiGetJson<ApiCourse[]>('/courses', {
      timeoutMs: 60000,
    });
    const full = await Promise.all(
      (courses ?? []).map((c) =>
        apiGetJson<ApiCourseById>(`/courses/${encodeURIComponent(c.id)}`, {
          timeoutMs: 60000,
        }),
      ),
    );
    const lessons = full.flatMap((c) => (c.lessons ?? []).map(apiLessonToRemote));
    return lessons;
  } catch (err) {
    console.warn(
      '[sync] pullLessons (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

export async function pullVideos(): Promise<RemoteVideo[]> {
  if (!isApiConfigured) return [];
  try {
    const courses = await apiGetJson<ApiCourse[]>('/courses', {
      timeoutMs: 60000,
    });
    const full = await Promise.all(
      (courses ?? []).map((c) =>
        apiGetJson<ApiCourseById>(`/courses/${encodeURIComponent(c.id)}`, {
          timeoutMs: 60000,
        }),
      ),
    );
    const videos = full.flatMap((c) =>
      (c.lessons ?? []).flatMap((l) => (l.videos ?? []).map(apiVideoToRemote)),
    );
    return videos;
  } catch (err) {
    console.warn(
      '[sync] pullVideos (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

export async function pullQuizzes(): Promise<RemoteQuiz[]> {
  if (!isApiConfigured) return [];
  try {
    const rows = await apiGetJson<ApiQuiz[]>('/quizzes', {
      timeoutMs: 60000,
    });
    return (rows ?? []).map(apiQuizToRemote);
  } catch (err) {
    console.warn(
      '[sync] pullQuizzes (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

export async function pullQuestions(quizId?: string): Promise<RemoteQuestion[]> {
  if (!isApiConfigured) return [];
  try {
    if (quizId) {
      const quiz = await apiGetJson<ApiQuizById>(
        `/quizzes/${encodeURIComponent(quizId)}`,
        { timeoutMs: 60000 },
      );
      return (quiz?.questions ?? []).map(apiQuestionToRemote);
    }

    // Fallback: pull all questions (can be large; avoid calling this on app startup).
    const quizzes = await apiGetJson<ApiQuiz[]>('/quizzes', { timeoutMs: 60000 });
    const full = await Promise.all(
      (quizzes ?? []).map((q) =>
        apiGetJson<ApiQuizById>(`/quizzes/${encodeURIComponent(q.id)}`, {
          timeoutMs: 60000,
        }),
      ),
    );
    return full.flatMap((q) => (q.questions ?? []).map(apiQuestionToRemote));
  } catch (err) {
    console.warn(
      '[sync] pullQuestions (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

// ---------------------------------------------------------------------------
// Stocks
// ---------------------------------------------------------------------------

type ApiStock = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  updatedAt: string;
};

export async function pullStockPrices(): Promise<RemoteStockPrice[]> {
  if (!isApiConfigured) return [];
  try {
    const rows = await apiGetJson<ApiStock[]>('/stocks');
    return (rows ?? []).map((s) => ({
      symbol: s.symbol,
      name: s.name,
      price: s.price,
      change_percent: s.changePercent,
      updated_at: s.updatedAt,
    }));
  } catch (err) {
    console.warn(
      '[sync] pullStockPrices (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

type ApiBootstrap = {
  courses: ApiCourse[];
  lessons: ApiLesson[];
  videos: ApiVideo[];
  quizzes: ApiQuiz[];
  questions: ApiQuestion[];
  stocks: ApiStock[];
};

export async function pullContentBootstrap(): Promise<{
  courses: RemoteCourse[];
  lessons: RemoteLesson[];
  videos: RemoteVideo[];
  quizzes: RemoteQuiz[];
  questions: RemoteQuestion[];
  stocks: RemoteStockPrice[];
} | null> {
  if (!isApiConfigured) return null;
  try {
    const data = await apiGetJson<ApiBootstrap>('/content/bootstrap', {
      timeoutMs: 60000,
    });
    return {
      courses: (data.courses ?? []).map(apiCourseToRemote),
      lessons: (data.lessons ?? []).map(apiLessonToRemote),
      videos: (data.videos ?? []).map(apiVideoToRemote),
      quizzes: (data.quizzes ?? []).map(apiQuizToRemote),
      questions: (data.questions ?? []).map(apiQuestionToRemote),
      stocks: (data.stocks ?? []).map((s) => ({
        symbol: s.symbol,
        name: s.name,
        price: s.price,
        change_percent: s.changePercent,
        updated_at: s.updatedAt,
      })),
    };
  } catch (err) {
    console.warn(
      '[sync] pullContentBootstrap (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

export async function upsertStockPrice(payload: {
  symbol: string;
  name: string;
  price: number;
  change_percent?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson(
      '/admin/stocks',
      {
        symbol: payload.symbol,
        name: payload.name,
        price: payload.price,
        changePercent: payload.change_percent ?? 0,
      },
      { auth: true },
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[sync] upsertStockPrice (API) failed', msg);
    return { ok: false, error: msg };
  }
}

export async function deleteStockPrice(
  symbol: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiRequestJson(`/admin/stocks/${encodeURIComponent(symbol)}`, {
      auth: true,
      method: 'DELETE',
    });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[sync] deleteStockPrice (API) failed', msg);
    return { ok: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Admin (minimal set used by existing screens)
// ---------------------------------------------------------------------------

export async function adminCounts(): Promise<{
  courses: number;
  lessons: number;
  videos: number;
  quizzes: number;
  questions: number;
  users: number;
  stocks: number;
}> {
  if (!isApiConfigured) {
    return { courses: 0, lessons: 0, videos: 0, quizzes: 0, questions: 0, users: 0, stocks: 0 };
  }
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) {
    return { courses: 0, lessons: 0, videos: 0, quizzes: 0, questions: 0, users: 0, stocks: 0 };
  }
  try {
    return await apiGetJson('/admin/counts', { auth: true });
  } catch {
    return { courses: 0, lessons: 0, videos: 0, quizzes: 0, questions: 0, users: 0, stocks: 0 };
  }
}

export async function adminDashboardStats(): Promise<{
  users_total: number;
  users_active_7d: number;
  coins_total: number;
  xp_total: number;
  quiz_attempts_total: number;
  coins_log_total: number;
  redemptions_total: number;
  redemptions_pending: number;
  redemptions_fulfilled: number;
  redemptions_rejected: number;
}> {
  if (!isApiConfigured)
    return {
      users_total: 0,
      users_active_7d: 0,
      coins_total: 0,
      xp_total: 0,
      quiz_attempts_total: 0,
      coins_log_total: 0,
      redemptions_total: 0,
      redemptions_pending: 0,
      redemptions_fulfilled: 0,
      redemptions_rejected: 0,
    };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed)
    return {
      users_total: 0,
      users_active_7d: 0,
      coins_total: 0,
      xp_total: 0,
      quiz_attempts_total: 0,
      coins_log_total: 0,
      redemptions_total: 0,
      redemptions_pending: 0,
      redemptions_fulfilled: 0,
      redemptions_rejected: 0,
    };
  try {
    return await apiGetJson('/admin/stats', { auth: true });
  } catch {
    return {
      users_total: 0,
      users_active_7d: 0,
      coins_total: 0,
      xp_total: 0,
      quiz_attempts_total: 0,
      coins_log_total: 0,
      redemptions_total: 0,
      redemptions_pending: 0,
      redemptions_fulfilled: 0,
      redemptions_rejected: 0,
    };
  }
}

export async function adminPullProfiles(limit = 200): Promise<RemoteProfile[]> {
  if (!isApiConfigured) return [];
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return [];
  try {
    const rows = await apiGetJson<ApiUser[]>(
      `/admin/users?limit=${encodeURIComponent(String(limit))}`,
      { auth: true },
    );
    return (rows ?? []).map(apiUserToRemoteProfile);
  } catch (err) {
    console.warn(
      '[sync] adminPullProfiles (API) failed',
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

export async function adminUpdateProfile(
  userId: string,
  patch: Partial<{
    display_name: string;
    avatar: string;
    level: UserLevel;
    coins: number;
    xp: number;
    streak: number;
    longest_streak: number;
    last_active_date: string | null;
    is_admin: boolean;
  }>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPatchJson(
      `/admin/users/${encodeURIComponent(userId)}`,
      {
        displayName: patch.display_name,
        avatar: patch.avatar,
        level: patch.level,
        coins: patch.coins,
        xp: patch.xp,
        streak: patch.streak,
        longestStreak: patch.longest_streak,
        lastActiveDate: patch.last_active_date,
        isAdmin: patch.is_admin,
      },
      { auth: true },
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[sync] adminUpdateProfile (API) failed', msg);
    return { ok: false, error: msg };
  }
}

export async function upsertCourse(course: CourseUpsert): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson(
      '/admin/courses',
      {
        id: course.id,
        title: course.title ?? '',
        titleAr: course.title_ar ?? null,
        description: course.description ?? '',
        descriptionAr: course.description_ar ?? null,
        topic: course.topic ?? 'all',
        icon: course.icon ?? '📚',
        color: course.color ?? '#2563eb',
        sortOrder: course.sort_order ?? 0,
        coinReward: course.coin_reward ?? 0,
      },
      { auth: true },
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function deleteCourse(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiRequestJson(`/admin/courses/${encodeURIComponent(id)}`, { auth: true, method: 'DELETE' });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function upsertLesson(lesson: LessonUpsert): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson(
      '/admin/lessons',
      {
        id: lesson.id,
        courseId: lesson.course_id,
        title: lesson.title ?? '',
        titleAr: lesson.title_ar ?? null,
        summary: lesson.summary ?? null,
        summaryAr: lesson.summary_ar ?? null,
        durationMinutes: lesson.duration_minutes ?? 0,
        sortOrder: lesson.sort_order ?? 0,
      },
      { auth: true },
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function deleteLesson(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiRequestJson(`/admin/lessons/${encodeURIComponent(id)}`, { auth: true, method: 'DELETE' });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function upsertVideo(video: VideoUpsert): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson(
      '/admin/videos',
      {
        id: video.id,
        lessonId: video.lesson_id,
        title: video.title ?? '',
        titleAr: video.title_ar ?? null,
        url: video.url ?? '',
        thumbnail: video.thumbnail ?? null,
        durationSeconds: video.duration_seconds ?? 0,
        sortOrder: video.sort_order ?? 0,
      },
      { auth: true },
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function deleteVideo(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiRequestJson(`/admin/videos/${encodeURIComponent(id)}`, { auth: true, method: 'DELETE' });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function upsertQuiz(quiz: QuizUpsert): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson(
      '/admin/quizzes',
      {
        id: quiz.id,
        title: quiz.title ?? '',
        titleAr: quiz.title_ar ?? null,
        description: quiz.description ?? null,
        descriptionAr: quiz.description_ar ?? null,
        category: quiz.category ?? 'general',
        difficulty: quiz.difficulty ?? 'easy',
        coinReward: quiz.coin_reward ?? 0,
      },
      { auth: true },
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function deleteQuiz(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiRequestJson(`/admin/quizzes/${encodeURIComponent(id)}`, { auth: true, method: 'DELETE' });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function upsertQuestion(question: QuestionUpsert): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiPostJson(
      '/admin/questions',
      {
        id: question.id,
        quizId: question.quiz_id,
        question: question.question ?? '',
        questionAr: question.question_ar ?? null,
        options: question.options ?? [],
        optionsAr: question.options_ar ?? null,
        correctIndex: question.correct_index ?? 0,
        explanation: question.explanation ?? null,
        explanationAr: question.explanation_ar ?? null,
        sortOrder: question.sort_order ?? 0,
      },
      { auth: true },
    );
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export async function deleteQuestion(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isApiConfigured) return { ok: false, error: 'API not configured' };
  const authed = await ensureApiAccessTokenLoaded();
  if (!authed) return { ok: false, error: 'Not authenticated' };
  try {
    await apiRequestJson(`/admin/questions/${encodeURIComponent(id)}`, { auth: true, method: 'DELETE' });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Local mapping helper (used by stores)
// ---------------------------------------------------------------------------

export function remoteProfileToLocal(remote: RemoteProfile): {
  profile: UserProfile;
  coins: number;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  isAdmin: boolean;
} {
  return {
    profile: {
      name: remote.display_name,
      email: '',
      avatar: remote.avatar ?? 'default',
      avatarImageUri: null,
      level: (remote.level ?? 'Beginner') as UserLevel,
      dateOfBirth: normalizeDateStamp(remote.date_of_birth),
      gender: (remote.gender as UserProfile['gender']) ?? null,
      mobile: remote.mobile ?? '',
      governorate: remote.governorate ?? '',
      city: remote.city ?? '',
      userType: (remote.user_type as UserProfile['userType']) ?? null,
      schoolName: remote.school_name ?? '',
      facultyMajor: remote.faculty_major ?? '',
      academicYear: remote.academic_year ?? '',
      employer: remote.employer ?? '',
      monthlyIncomeRange:
        (remote.monthly_income_range as UserProfile['monthlyIncomeRange']) ?? null,
      financialGoals: parseFinancialGoals(remote.financial_goals),
      financialLiteracy:
        (remote.financial_literacy as UserProfile['financialLiteracy']) ?? null,
      persona: remote.persona,
      parentEmail: remote.parent_email ?? '',
      parentPhone: remote.parent_phone ?? '',
      referralCode: remote.referral_code ?? '',
      referredByCode: remote.referred_by_code ?? '',
      profileCompletedAt: normalizeDateStamp(remote.profile_completed_at),
    },
    coins: remote.coins ?? 0,
    xp: remote.xp ?? 0,
    streak: remote.streak ?? 0,
    longestStreak: remote.longest_streak ?? 0,
    lastActiveDate: normalizeDateStamp(remote.last_active_date),
    isAdmin: !!remote.is_admin,
  };
}

