import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { CoinsReason, UserLevel, UserProfile } from '@/stores/useUserStore';

/**
 * syncService — thin wrapper around Supabase tables. Every function is safe
 * to call in offline mode: if Supabase isn't configured it resolves quietly.
 *
 * Tables in use:
 *   - profiles        (1 row per user — source of truth for coins/xp/streak)
 *   - coins_log       (append-only ledger of coin changes)
 *   - user_progress   (per simulation/course progress)
 */

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

export interface RemoteRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  reward_title: string;
  cost: number;
  status: 'pending' | 'fulfilled' | 'rejected';
  created_at: string;
}

/**
 * Pull the user's profile from Supabase. Returns null if row missing or offline.
 */
export async function pullProfile(
  userId: string
): Promise<RemoteProfile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.warn('[sync] pullProfile failed', error.message);
    }
    return null;
  }
  return data as RemoteProfile;
}

export async function adminPullProfiles(
  limit = 200
): Promise<RemoteProfile[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[sync] adminPullProfiles failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteProfile[];
}

export async function adminUpdateProfile(
  userId: string,
  patch: Partial<Pick<RemoteProfile, 'display_name' | 'avatar' | 'level' | 'coins' | 'xp' | 'streak' | 'longest_streak' | 'is_admin'>>
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) {
    console.warn('[sync] adminUpdateProfile failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export interface PushProfilePatch {
  display_name?: string;
  avatar?: string;
  level?: UserLevel;
  coins?: number;
  xp?: number;
  streak?: number;
  longest_streak?: number;
  last_active_date?: string | null;
}

/**
 * Upsert profile fields for the current user. Uses update-then-insert
 * so we don't need elevated perms — the row is created by the auth trigger.
 */
export async function pushProfile(
  userId: string,
  patch: PushProfilePatch
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const payload = { ...patch, updated_at: new Date().toISOString() };
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId);

  if (error) {
    console.warn('[sync] pushProfile failed', error.message);
    return false;
  }
  return true;
}

/**
 * Append a coin change to the ledger. Fire-and-forget: failure just logs.
 */
export async function logCoinChange(
  userId: string,
  amount: number,
  reason: CoinsReason | string
): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (amount === 0) return;
  const { error } = await supabase
    .from('coins_log')
    .insert({ user_id: userId, amount, reason });
  if (error) {
    console.warn('[sync] logCoinChange failed', error.message);
  }
}

/**
 * Pull the user's latest coin ledger entries (default: 50).
 */
export async function pullCoinsLog(
  userId: string,
  limit = 50
): Promise<RemoteCoinsLog[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('coins_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[sync] pullCoinsLog failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteCoinsLog[];
}

/**
 * Upsert a progress row (keyed on user + kind + ref_id).
 */
export async function upsertProgress(
  userId: string,
  kind: RemoteProgress['kind'],
  refId: string,
  progress: number,
  completed = false
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      kind,
      ref_id: refId,
      progress,
      completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,kind,ref_id' }
  );
  if (error) {
    console.warn('[sync] upsertProgress failed', error.message);
  }
}

export async function pullProgress(
  userId: string
): Promise<RemoteProgress[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.warn('[sync] pullProgress failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteProgress[];
}

export async function pullLeaderboardTop(
  limit = 10
): Promise<RemoteLeaderboardEntry[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.rpc('leaderboard_top', { p_limit: limit });
  if (error) {
    console.warn('[sync] pullLeaderboardTop failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteLeaderboardEntry[];
}

export type AdminDashboardStats = {
  users_total: number;
  users_active_7d: number;
  coins_total: number;
  xp_total: number;
  quiz_attempts_total: number;
  redemptions_total: number;
  redemptions_pending: number;
  redemptions_fulfilled: number;
  redemptions_rejected: number;
};

export async function adminDashboardStats(): Promise<AdminDashboardStats | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc('admin_dashboard_stats');
  if (error) {
    console.warn('[sync] adminDashboardStats failed', error.message);
    return null;
  }
  return (data ?? null) as AdminDashboardStats | null;
}

export async function pullRedemptions(
  userId: string,
  limit = 50
): Promise<RemoteRedemption[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('redemptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[sync] pullRedemptions failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteRedemption[];
}

export async function createRedemption(
  userId: string,
  row: { rewardId: string; rewardTitle: string; cost: number }
): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const payload = {
    user_id: userId,
    reward_id: row.rewardId,
    reward_title: row.rewardTitle,
    cost: row.cost,
    status: 'pending' as const,
  };
  const { data, error } = await supabase
    .from('redemptions')
    .insert(payload)
    .select('id')
    .single();
  if (error) {
    console.warn('[sync] createRedemption failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: (data as any)?.id };
}

export async function adminPullRedemptions(
  limit = 200
): Promise<RemoteRedemption[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('redemptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[sync] adminPullRedemptions failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteRedemption[];
}

export async function adminUpdateRedemptionStatus(
  id: string,
  status: RemoteRedemption['status']
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase
    .from('redemptions')
    .update({ status })
    .eq('id', id);
  if (error) {
    console.warn('[sync] adminUpdateRedemptionStatus failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// ============================================================================
// Content: Courses / Lessons / Videos / Quizzes
// ============================================================================
export interface RemoteCourse {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  topic: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  coin_reward: number;
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
}

// ============================================================================
// FinTok — curated short videos
// ============================================================================
export interface RemoteFinTokVideo {
  id: string;
  title: string;
  title_ar: string | null;
  creator_name: string;
  creator_name_ar: string | null;
  creator_avatar: string;
  caption: string | null;
  caption_ar: string | null;
  tags: string[];
  simulation_route: string | null;
  storage_bucket: string;
  storage_path: string;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number;
  sort_order: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface RemoteFinTokComment {
  id: string;
  video_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export async function pullFinTokVideos(
  limit = 200
): Promise<RemoteFinTokVideo[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('fintok_videos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[sync] pullFinTokVideos failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteFinTokVideo[];
}

export async function adminPullFinTokVideos(
  limit = 500
): Promise<RemoteFinTokVideo[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('fintok_videos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[sync] adminPullFinTokVideos failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteFinTokVideo[];
}

export type FinTokVideoUpsert = Pick<
  RemoteFinTokVideo,
  | 'id'
  | 'title'
  | 'title_ar'
  | 'creator_name'
  | 'creator_name_ar'
  | 'creator_avatar'
  | 'caption'
  | 'caption_ar'
  | 'tags'
  | 'simulation_route'
  | 'storage_bucket'
  | 'storage_path'
  | 'video_url'
  | 'thumbnail_url'
  | 'duration_seconds'
  | 'sort_order'
  | 'is_published'
  | 'published_at'
>;

export async function adminUpsertFinTokVideo(
  row: Partial<FinTokVideoUpsert> & Pick<FinTokVideoUpsert, 'title' | 'storage_path'>
): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const payload = {
    storage_bucket: 'fintok',
    tags: [],
    sort_order: 0,
    is_published: true,
    ...row,
  };
  const { data, error } = await supabase
    .from('fintok_videos')
    .upsert(payload, { onConflict: 'id' })
    .select('id')
    .single();
  if (error) {
    console.warn('[sync] adminUpsertFinTokVideo failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: (data as { id: string } | null)?.id };
}

export async function adminDeleteFinTokVideo(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('fintok_videos').delete().eq('id', id);
  if (error) {
    console.warn('[sync] adminDeleteFinTokVideo failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function pullFinTokLikeIds(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('fintok_likes')
    .select('video_id')
    .eq('user_id', userId);
  if (error) {
    console.warn('[sync] pullFinTokLikeIds failed', error.message);
    return [];
  }
  return (data ?? []).map((r) => String((r as { video_id: string }).video_id));
}

export async function pullFinTokSaveIds(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('fintok_saves')
    .select('video_id')
    .eq('user_id', userId);
  if (error) {
    console.warn('[sync] pullFinTokSaveIds failed', error.message);
    return [];
  }
  return (data ?? []).map((r) => String((r as { video_id: string }).video_id));
}

export async function setFinTokLike(
  userId: string,
  videoId: string,
  liked: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  if (liked) {
    const { error } = await supabase
      .from('fintok_likes')
      .insert({ user_id: userId, video_id: videoId });
    if (error) {
      console.warn('[sync] setFinTokLike(insert) failed', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }
  const { error } = await supabase
    .from('fintok_likes')
    .delete()
    .eq('user_id', userId)
    .eq('video_id', videoId);
  if (error) {
    console.warn('[sync] setFinTokLike(delete) failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function setFinTokSave(
  userId: string,
  videoId: string,
  saved: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  if (saved) {
    const { error } = await supabase
      .from('fintok_saves')
      .insert({ user_id: userId, video_id: videoId });
    if (error) {
      console.warn('[sync] setFinTokSave(insert) failed', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }
  const { error } = await supabase
    .from('fintok_saves')
    .delete()
    .eq('user_id', userId)
    .eq('video_id', videoId);
  if (error) {
    console.warn('[sync] setFinTokSave(delete) failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function pullFinTokComments(
  videoId: string,
  limit = 200
): Promise<RemoteFinTokComment[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('fintok_comments')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[sync] pullFinTokComments failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteFinTokComment[];
}

export async function addFinTokComment(
  userId: string,
  videoId: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: 'Empty comment.' };
  const { error } = await supabase
    .from('fintok_comments')
    .insert({ user_id: userId, video_id: videoId, body: trimmed });
  if (error) {
    console.warn('[sync] addFinTokComment failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// ============================================================================
// Marketplace products
// ============================================================================
export interface RemoteMarketplaceProduct {
  id: string;
  category: string;
  bank: string;
  logo: string;
  name: string;
  apr: number;
  annual_fee: number;
  cashback: number;
  rating: number;
  reviews_count: number;
  tier: 'strong' | 'moderate' | 'high';
  min_income: number;
  min_age: number | null;
  min_credit_score: number | null;
  benefits: string[];
  pros: string[];
  cons: string[];
  best_for: string;
  is_best_value: boolean;
  sort_order: number;
}

export async function pullMarketplaceProducts(
  category = 'credit-cards'
): Promise<RemoteMarketplaceProduct[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('marketplace_products')
    .select('*')
    .eq('category', category)
    .order('sort_order', { ascending: true });

  if (error) {
    console.warn('[sync] pullMarketplaceProducts failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteMarketplaceProduct[];
}

export type MarketplaceProductUpsert = Pick<
  RemoteMarketplaceProduct,
  | 'id'
  | 'category'
  | 'bank'
  | 'logo'
  | 'name'
  | 'apr'
  | 'annual_fee'
  | 'cashback'
  | 'tier'
  | 'min_income'
  | 'min_age'
  | 'min_credit_score'
  | 'benefits'
  | 'pros'
  | 'cons'
  | 'best_for'
  | 'is_best_value'
  | 'sort_order'
> &
  Partial<Pick<RemoteMarketplaceProduct, 'rating' | 'reviews_count'>>;

export async function upsertMarketplaceProduct(
  product: MarketplaceProductUpsert
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('marketplace_products').upsert(product, {
    onConflict: 'id',
  });
  if (error) {
    console.warn('[sync] upsertMarketplaceProduct failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteMarketplaceProduct(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('marketplace_products').delete().eq('id', id);
  if (error) {
    console.warn('[sync] deleteMarketplaceProduct failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function pullCourses(): Promise<RemoteCourse[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.warn('[sync] pullCourses failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteCourse[];
}

export async function adminCounts(): Promise<{
  users: number;
  courses: number;
  lessons: number;
  videos: number;
  quizzes: number;
  questions: number;
  marketplaceProducts: number;
}> {
  if (!isSupabaseConfigured) {
    return {
      users: 0,
      courses: 0,
      lessons: 0,
      videos: 0,
      quizzes: 0,
      questions: 0,
      marketplaceProducts: 0,
    };
  }

  async function count(table: string): Promise<number> {
    const { count, error } = await supabase.from(table).select('*', {
      count: 'exact',
      head: true,
    });
    if (error) {
      console.warn('[sync] count failed', table, error.message);
      return 0;
    }
    return count ?? 0;
  }

  const [
    users,
    courses,
    lessons,
    videos,
    quizzes,
    questions,
    marketplaceProducts,
  ] = await Promise.all([
    count('profiles'),
    count('courses'),
    count('lessons'),
    count('videos'),
    count('quizzes'),
    count('questions'),
    count('marketplace_products'),
  ]);

  return {
    users,
    courses,
    lessons,
    videos,
    quizzes,
    questions,
    marketplaceProducts,
  };
}

// ============================================================================
// Stock prices overrides (admin tool)
// ============================================================================
export interface RemoteStockPrice {
  symbol: string;
  price: number;
  updated_at: string;
}

export async function pullStockPrices(): Promise<RemoteStockPrice[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('stock_prices')
    .select('*')
    .order('symbol', { ascending: true });
  if (error) {
    console.warn('[sync] pullStockPrices failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteStockPrice[];
}

export async function upsertStockPrice(
  row: { symbol: string; price: number }
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const payload = {
    symbol: row.symbol.trim().toUpperCase(),
    price: row.price,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('stock_prices').upsert(payload, {
    onConflict: 'symbol',
  });
  if (error) {
    console.warn('[sync] upsertStockPrice failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteStockPrice(
  symbol: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('stock_prices').delete().eq('symbol', symbol);
  if (error) {
    console.warn('[sync] deleteStockPrice failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
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

export async function upsertCourse(
  course: CourseUpsert
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('courses').upsert(course, {
    onConflict: 'id',
  });
  if (error) {
    console.warn('[sync] upsertCourse failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteCourse(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) {
    console.warn('[sync] deleteCourse failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function pullLessons(courseId?: string): Promise<RemoteLesson[]> {
  if (!isSupabaseConfigured) return [];
  let q = supabase.from('lessons').select('*').order('sort_order', { ascending: true });
  if (courseId) q = q.eq('course_id', courseId);
  const { data, error } = await q;
  if (error) {
    console.warn('[sync] pullLessons failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteLesson[];
}

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

export async function upsertLesson(
  lesson: LessonUpsert
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('lessons').upsert(lesson, { onConflict: 'id' });
  if (error) {
    console.warn('[sync] upsertLesson failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteLesson(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) {
    console.warn('[sync] deleteLesson failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function pullVideos(lessonId?: string): Promise<RemoteVideo[]> {
  if (!isSupabaseConfigured) return [];
  let q = supabase.from('videos').select('*').order('sort_order', { ascending: true });
  if (lessonId) q = q.eq('lesson_id', lessonId);
  const { data, error } = await q;
  if (error) {
    console.warn('[sync] pullVideos failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteVideo[];
}

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

export async function upsertVideo(
  video: VideoUpsert
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('videos').upsert(video, { onConflict: 'id' });
  if (error) {
    console.warn('[sync] upsertVideo failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteVideo(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) {
    console.warn('[sync] deleteVideo failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function pullQuizzes(): Promise<RemoteQuiz[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('category', { ascending: true });
  if (error) {
    console.warn('[sync] pullQuizzes failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteQuiz[];
}

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

export async function upsertQuiz(
  quiz: QuizUpsert
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('quizzes').upsert(quiz, { onConflict: 'id' });
  if (error) {
    console.warn('[sync] upsertQuiz failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteQuiz(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('quizzes').delete().eq('id', id);
  if (error) {
    console.warn('[sync] deleteQuiz failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function pullQuestions(quizId?: string): Promise<RemoteQuestion[]> {
  if (!isSupabaseConfigured) return [];
  let q = supabase.from('questions').select('*').order('sort_order', { ascending: true });
  if (quizId) q = q.eq('quiz_id', quizId);
  const { data, error } = await q;
  if (error) {
    console.warn('[sync] pullQuestions failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteQuestion[];
}

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

export async function upsertQuestion(
  row: QuestionUpsert
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('questions').upsert(row, { onConflict: 'id' });
  if (error) {
    console.warn('[sync] upsertQuestion failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteQuestion(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Supabase not configured.' };
  const { error } = await supabase.from('questions').delete().eq('id', id);
  if (error) {
    console.warn('[sync] deleteQuestion failed', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function recordQuizAttempt(
  userId: string,
  quizId: string,
  score: number,
  total: number,
  coinsEarned: number
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('quiz_attempts').insert({
    user_id: userId,
    quiz_id: quizId,
    score,
    total,
    coins_earned: coinsEarned,
  });
  if (error) {
    console.warn('[sync] recordQuizAttempt failed', error.message);
  }
}

// ============================================================================
// Banking transactions
// ============================================================================
export interface RemoteBankingTxn {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'transfer';
  category: string;
  note: string | null;
  at: string;
}

export async function pushBankingTransaction(
  userId: string,
  txn: {
    id: string;
    accountId: string;
    amount: number;
    type: 'deposit' | 'withdraw' | 'transfer';
    category: string;
    note?: string;
    at: number;
  }
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('banking_transactions').insert({
    id: txn.id,
    user_id: userId,
    account_id: txn.accountId,
    amount: txn.amount,
    type: txn.type,
    category: txn.category,
    note: txn.note ?? null,
    at: new Date(txn.at).toISOString(),
  });
  if (error) {
    console.warn('[sync] pushBankingTransaction failed', error.message);
  }
}

export async function pullBankingTransactions(
  userId: string,
  limit = 100
): Promise<RemoteBankingTxn[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('banking_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[sync] pullBankingTransactions failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteBankingTxn[];
}

// ============================================================================
// Investment — trades + holdings
// ============================================================================
export interface RemoteHolding {
  user_id: string;
  symbol: string;
  shares: number;
  avg_cost: number;
  updated_at: string;
}

export interface RemoteTrade {
  id: string;
  user_id: string;
  symbol: string;
  action: 'buy' | 'sell';
  shares: number;
  price: number;
  at: string;
}

export async function pushInvestmentTrade(
  userId: string,
  trade: {
    id: string;
    symbol: string;
    action: 'buy' | 'sell';
    shares: number;
    price: number;
    at: number;
  }
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('investment_trades').insert({
    id: trade.id,
    user_id: userId,
    symbol: trade.symbol,
    action: trade.action,
    shares: trade.shares,
    price: trade.price,
    at: new Date(trade.at).toISOString(),
  });
  if (error) {
    console.warn('[sync] pushInvestmentTrade failed', error.message);
  }
}

export async function upsertInvestmentHolding(
  userId: string,
  holding: { symbol: string; shares: number; avgCost: number }
): Promise<void> {
  if (!isSupabaseConfigured) return;

  // If shares drop to 0, delete the row instead.
  if (holding.shares <= 0) {
    const { error } = await supabase
      .from('investment_holdings')
      .delete()
      .eq('user_id', userId)
      .eq('symbol', holding.symbol);
    if (error) {
      console.warn('[sync] upsertInvestmentHolding(delete) failed', error.message);
    }
    return;
  }

  const { error } = await supabase.from('investment_holdings').upsert(
    {
      user_id: userId,
      symbol: holding.symbol,
      shares: holding.shares,
      avg_cost: holding.avgCost,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,symbol' }
  );
  if (error) {
    console.warn('[sync] upsertInvestmentHolding failed', error.message);
  }
}

export async function pullInvestmentHoldings(
  userId: string
): Promise<RemoteHolding[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('investment_holdings')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.warn('[sync] pullInvestmentHoldings failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteHolding[];
}

export async function pullInvestmentTrades(
  userId: string,
  limit = 100
): Promise<RemoteTrade[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('investment_trades')
    .select('*')
    .eq('user_id', userId)
    .order('at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[sync] pullInvestmentTrades failed', error.message);
    return [];
  }
  return (data ?? []) as RemoteTrade[];
}

/**
 * Merge a remote profile into the user store defaults. Remote wins
 * on conflict for canonical fields (coins, xp, streak).
 */
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
      avatar: remote.avatar ?? '👤',
      level: (remote.level ?? 'Beginner') as UserLevel,
    },
    coins: remote.coins ?? 0,
    xp: remote.xp ?? 0,
    streak: remote.streak ?? 0,
    longestStreak: remote.longest_streak ?? 0,
    lastActiveDate: remote.last_active_date,
    isAdmin: !!remote.is_admin,
  };
}
