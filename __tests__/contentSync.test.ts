import { useContentStore } from '@/stores/useContentStore';

jest.mock('@/lib/syncService', () => ({
  pullCourses: jest.fn(async () => [
    {
      id: 'c1',
      title: 'Course 1',
      description: 'Desc',
      icon: '📚',
      color: '#111111',
      sort_order: 1,
      coin_reward: 10,
    },
  ]),
  pullLessons: jest.fn(async () => [
    {
      id: 'l1',
      course_id: 'c1',
      title: 'Lesson 1',
      summary: 'Sum',
      duration_minutes: 5,
      sort_order: 1,
    },
  ]),
  pullVideos: jest.fn(async () => [
    {
      id: 'v1',
      lesson_id: 'l1',
      title: 'Video 1',
      url: 'https://example.com/v.mp4',
      thumbnail: null,
      duration_seconds: 10,
      sort_order: 1,
    },
  ]),
  pullQuizzes: jest.fn(async () => []),
  pullQuestions: jest.fn(async () => []),
  recordQuizAttempt: jest.fn(async () => undefined),
  upsertProgress: jest.fn(async () => undefined),
}));

describe('useContentStore.syncFromCloud', () => {
  beforeEach(() => {
    useContentStore.setState({
      courses: [],
      lessons: [],
      videos: [],
      quizzes: [],
      questions: [],
      completedLessons: [],
      completedQuizzes: [],
      watchedVideos: [],
      loaded: false,
      lastSyncedAt: null,
      syncStatus: 'idle',
      syncError: null,
    } as any);
  });

  test('hydrates courses/lessons/videos from remote', async () => {
    await useContentStore.getState().syncFromCloud();
    const s = useContentStore.getState();
    expect(s.loaded).toBe(true);
    expect(s.syncStatus).toBe('success');
    expect(s.courses[0]).toEqual(
      expect.objectContaining({ id: 'c1', title: 'Course 1', coinReward: 10 })
    );
    expect(s.lessons[0]).toEqual(
      expect.objectContaining({ id: 'l1', courseId: 'c1', title: 'Lesson 1' })
    );
    expect(s.videos[0]).toEqual(
      expect.objectContaining({ id: 'v1', lessonId: 'l1', title: 'Video 1' })
    );
  });
});

