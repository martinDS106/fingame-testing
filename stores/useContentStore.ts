import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  pullCourses,
  pullLessons,
  pullQuestions,
  pullQuizzes,
  pullVideos,
  recordQuizAttempt,
  upsertProgress,
  type RemoteCourse,
  type RemoteLesson,
  type RemoteQuestion,
  type RemoteQuiz,
  type RemoteVideo,
} from '@/lib/syncService';
import { useUserStore } from '@/stores/useUserStore';
import { useLocaleStore } from '@/stores/useLocaleStore';

import { asyncStorage } from './storage';

// --------------------------------------------------------------------------
// Normalized app-shape types (camelCase). We keep a local fallback so the
// app is usable offline / before first sync.
// --------------------------------------------------------------------------
export interface Course {
  id: string;
  title: string;
  description: string;
  topic: string;
  icon: string;
  color: string;
  sortOrder: number;
  coinReward: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  durationMinutes: number;
  sortOrder: number;
}

export interface Video {
  id: string;
  lessonId: string;
  title: string;
  url: string;
  thumbnail: string | null;
  durationSeconds: number;
  sortOrder: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  coinReward: number;
}

export interface Question {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sortOrder: number;
}

// --------------------------------------------------------------------------
// Offline fallback content — used until Supabase sync succeeds.
// --------------------------------------------------------------------------
const FALLBACK_COURSES: Course[] = [
  {
    id: 'investing-basics',
    title: 'Investing Basics',
    description: 'Learn fundamental investment principles',
    topic: 'investing',
    icon: '📈',
    color: '#2563eb',
    sortOrder: 1,
    coinReward: 200,
  },
  {
    id: 'budgeting-101',
    title: 'Budgeting 101',
    description: 'Master personal finance management',
    topic: 'budgeting',
    icon: '💰',
    color: '#eab308',
    sortOrder: 2,
    coinReward: 150,
  },
  {
    id: 'stock-market',
    title: 'Stock Market Essentials',
    description: 'Understand EGX dynamics and trading',
    topic: 'investing',
    icon: '🏛️',
    color: '#a855f7',
    sortOrder: 3,
    coinReward: 250,
  },
  {
    id: 'credit-health',
    title: 'Credit & Loans',
    description: 'Build a strong credit score in Egypt',
    topic: 'saving',
    icon: '💳',
    color: '#22c55e',
    sortOrder: 4,
    coinReward: 200,
  },
  {
    id: 'gold-silver',
    title: 'Gold & Silver 101',
    description: 'How precious metals protect wealth',
    topic: 'investing',
    icon: '🥇',
    color: '#f97316',
    sortOrder: 5,
    coinReward: 150,
  },
];

const FALLBACK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-investing',
    title: 'Investing Fundamentals',
    description: 'Test your investment knowledge',
    category: 'investing',
    difficulty: 'easy',
    coinReward: 50,
  },
  {
    id: 'quiz-budgeting',
    title: 'Smart Budgeting',
    description: 'Master money management',
    category: 'budgeting',
    difficulty: 'easy',
    coinReward: 40,
  },
  {
    id: 'quiz-egx',
    title: 'EGX & Stocks',
    description: 'Egyptian Exchange quiz',
    category: 'stocks',
    difficulty: 'medium',
    coinReward: 75,
  },
  {
    id: 'quiz-credit',
    title: 'Credit & Loans',
    description: 'Understand credit scoring',
    category: 'credit',
    difficulty: 'medium',
    coinReward: 75,
  },
  {
    id: 'quiz-gold',
    title: 'Gold & Silver',
    description: 'Precious metals basics',
    category: 'gold',
    difficulty: 'easy',
    coinReward: 40,
  },
];

// --------------------------------------------------------------------------
// Adapters (remote -> local camelCase)
// --------------------------------------------------------------------------
function isAr(): boolean {
  return useLocaleStore.getState().locale === 'ar';
}

function pickText(ar: string | null | undefined, en: string): string {
  if (!isAr()) return en;
  const v = (ar ?? '').trim();
  return v.length > 0 ? v : en;
}

function normalizeOptions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((x) => String(x));
  return [];
}

function adaptCourse(r: RemoteCourse): Course {
  return {
    id: r.id,
    title: pickText(r.title_ar, r.title),
    description: pickText(r.description_ar, r.description ?? ''),
    topic: (r.topic ?? '').trim() || 'investing',
    icon: r.icon ?? '📚',
    color: r.color ?? '#2563eb',
    sortOrder: r.sort_order,
    coinReward: r.coin_reward,
  };
}

function adaptLesson(r: RemoteLesson): Lesson {
  return {
    id: r.id,
    courseId: r.course_id,
    title: pickText(r.title_ar, r.title),
    summary: pickText(r.summary_ar, r.summary ?? ''),
    durationMinutes: r.duration_minutes,
    sortOrder: r.sort_order,
  };
}

function adaptVideo(r: RemoteVideo): Video {
  return {
    id: r.id,
    lessonId: r.lesson_id,
    title: pickText(r.title_ar, r.title),
    url: r.url,
    thumbnail: r.thumbnail,
    durationSeconds: r.duration_seconds,
    sortOrder: r.sort_order,
  };
}

function adaptQuiz(r: RemoteQuiz): Quiz {
  return {
    id: r.id,
    title: pickText(r.title_ar, r.title),
    description: pickText(r.description_ar, r.description ?? ''),
    category: r.category,
    difficulty: r.difficulty,
    coinReward: r.coin_reward,
  };
}

function adaptQuestion(r: RemoteQuestion): Question {
  const optionsAr = normalizeOptions(r.options_ar);
  const optionsEn = normalizeOptions(r.options);
  const options =
    isAr() && optionsAr.length === optionsEn.length && optionsAr.length > 0
      ? optionsAr
      : optionsEn;

  return {
    id: r.id,
    quizId: r.quiz_id,
    question: pickText(r.question_ar, r.question),
    options,
    correctIndex: r.correct_index,
    explanation: pickText(r.explanation_ar, r.explanation ?? ''),
    sortOrder: r.sort_order,
  };
}

// --------------------------------------------------------------------------
// Store
// --------------------------------------------------------------------------
interface ContentState {
  rawCourses: RemoteCourse[];
  rawLessons: RemoteLesson[];
  rawVideos: RemoteVideo[];
  rawQuizzes: RemoteQuiz[];
  rawQuestions: RemoteQuestion[];

  courses: Course[];
  lessons: Lesson[];
  videos: Video[];
  quizzes: Quiz[];
  questions: Question[];
  completedLessons: string[];
  completedQuizzes: string[];
  loaded: boolean;
  lastSyncedAt: number | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError: string | null;

  watchedVideos: string[];

  lessonsFor: (courseId: string) => Lesson[];
  questionsFor: (quizId: string) => Question[];
  quizFor: (id: string) => Quiz | undefined;
  courseFor: (id: string) => Course | undefined;
  isLessonCompleted: (id: string) => boolean;
  videoForLesson: (lessonId: string) => Video | undefined;
  isVideoWatched: (videoId: string) => boolean;

  syncFromCloud: () => Promise<void>;
  relocalizeFromCache: () => void;
  completeLesson: (lessonId: string, coinReward?: number) => void;
  markVideoWatched: (videoId: string, lessonId: string) => void;
  submitAttempt: (quizId: string, score: number, total: number) => Promise<void>;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      rawCourses: [],
      rawLessons: [],
      rawVideos: [],
      rawQuizzes: [],
      rawQuestions: [],

      courses: FALLBACK_COURSES,
      lessons: [],
      videos: [],
      quizzes: FALLBACK_QUIZZES,
      questions: [],
      completedLessons: [],
      completedQuizzes: [],
      watchedVideos: [],
      loaded: false,
      lastSyncedAt: null,
      syncStatus: 'idle',
      syncError: null,

      lessonsFor: (courseId) =>
        get().lessons.filter((l) => l.courseId === courseId)
          .sort((a, b) => a.sortOrder - b.sortOrder),

      questionsFor: (quizId) =>
        get().questions.filter((q) => q.quizId === quizId)
          .sort((a, b) => a.sortOrder - b.sortOrder),

      quizFor: (id) => get().quizzes.find((q) => q.id === id),
      courseFor: (id) => get().courses.find((c) => c.id === id),
      isLessonCompleted: (id) => get().completedLessons.includes(id),
      videoForLesson: (lessonId) =>
        get()
          .videos.filter((v) => v.lessonId === lessonId)
          .sort((a, b) => a.sortOrder - b.sortOrder)[0],
      isVideoWatched: (videoId) => get().watchedVideos.includes(videoId),

      markVideoWatched: (videoId, lessonId) => {
        if (get().watchedVideos.includes(videoId)) return;
        set((state) => ({
          watchedVideos: [...state.watchedVideos, videoId],
        }));
        // Completing the video counts as completing the lesson.
        get().completeLesson(lessonId, 15);
        const userId = useUserStore.getState().remoteUserId;
        if (userId) {
          void upsertProgress(userId, 'video', videoId, 100, true);
        }
      },

      completeLesson: (lessonId, coinReward = 10) => {
        if (get().completedLessons.includes(lessonId)) return;
        set((state) => ({
          completedLessons: [...state.completedLessons, lessonId],
        }));
        const userStore = useUserStore.getState();
        userStore.addCoins(coinReward, 'lesson_complete');
        userStore.addXP(25);

        const userId = userStore.remoteUserId;
        if (userId) {
          void upsertProgress(userId, 'lesson', lessonId, 100, true);
        }
      },

      syncFromCloud: async () => {
        set({ syncStatus: 'syncing', syncError: null });
        try {
          const [rawCourses, rawLessons, rawVideos, rawQuizzes, rawQuestions] =
            await Promise.all([
              pullCourses(),
              pullLessons(),
              pullVideos(),
              pullQuizzes(),
              pullQuestions(),
            ]);

          if (!rawCourses.length && !rawQuizzes.length) {
            set({ loaded: true, syncStatus: 'success', lastSyncedAt: Date.now() });
            return;
          }

          set({
            rawCourses,
            rawLessons,
            rawVideos,
            rawQuizzes,
            rawQuestions,
            courses: rawCourses.length
              ? rawCourses.map(adaptCourse)
              : get().courses,
            lessons: rawLessons.map(adaptLesson),
            videos: rawVideos.map(adaptVideo),
            quizzes: rawQuizzes.length
              ? rawQuizzes.map(adaptQuiz)
              : get().quizzes,
            questions: rawQuestions.map(adaptQuestion),
            loaded: true,
            lastSyncedAt: Date.now(),
            syncStatus: 'success',
            syncError: null,
          });
        } catch (err) {
          console.warn('[content] syncFromCloud failed', err);
          const message =
            err instanceof Error ? err.message : 'Unknown sync error';
          set({ loaded: true, syncStatus: 'error', syncError: message });
        }
      },

      relocalizeFromCache: () => {
        const state = get();
        if (
          !state.rawCourses.length &&
          !state.rawLessons.length &&
          !state.rawVideos.length &&
          !state.rawQuizzes.length &&
          !state.rawQuestions.length
        ) {
          return;
        }

        set({
          courses: state.rawCourses.length
            ? state.rawCourses.map(adaptCourse)
            : state.courses,
          lessons: state.rawLessons.map(adaptLesson),
          videos: state.rawVideos.map(adaptVideo),
          quizzes: state.rawQuizzes.length
            ? state.rawQuizzes.map(adaptQuiz)
            : state.quizzes,
          questions: state.rawQuestions.map(adaptQuestion),
        });
      },

      submitAttempt: async (quizId, score, total) => {
        const quiz = get().quizFor(quizId);
        if (!quiz) return;
        const ratio = total > 0 ? score / total : 0;
        const coinsEarned = Math.round(quiz.coinReward * ratio);

        if (coinsEarned > 0) {
          const reason = ratio === 1 ? 'quiz_perfect' : 'quiz_correct';
          useUserStore.getState().addCoins(coinsEarned, reason);
        }
        if (!get().completedQuizzes.includes(quizId)) {
          set((state) => ({
            completedQuizzes: [...state.completedQuizzes, quizId],
          }));
        }
        const userId = useUserStore.getState().remoteUserId;
        if (userId) {
          await recordQuizAttempt(userId, quizId, score, total, coinsEarned);
          await upsertProgress(userId, 'quiz', quizId, ratio * 100, true);
        }
      },
    }),
    {
      name: 'fin-game/content',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        rawCourses: state.rawCourses,
        rawLessons: state.rawLessons,
        rawVideos: state.rawVideos,
        rawQuizzes: state.rawQuizzes,
        rawQuestions: state.rawQuestions,
        courses: state.courses,
        lessons: state.lessons,
        videos: state.videos,
        quizzes: state.quizzes,
        questions: state.questions,
        completedLessons: state.completedLessons,
        completedQuizzes: state.completedQuizzes,
        watchedVideos: state.watchedVideos,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
