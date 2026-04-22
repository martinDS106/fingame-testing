import { useContentStore } from '@/stores/useContentStore';

describe('useContentStore', () => {
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
      loaded: true,
      lastSyncedAt: null,
      syncStatus: 'idle',
      syncError: null,
    } as any);
  });

  test('videoForLesson returns lowest sortOrder video', () => {
    useContentStore.setState({
      videos: [
        {
          id: 'v2',
          lessonId: 'l1',
          title: 'B',
          url: 'u2',
          thumbnail: null,
          durationSeconds: 1,
          sortOrder: 2,
        },
        {
          id: 'v1',
          lessonId: 'l1',
          title: 'A',
          url: 'u1',
          thumbnail: null,
          durationSeconds: 1,
          sortOrder: 1,
        },
      ],
    } as any);

    const v = useContentStore.getState().videoForLesson('l1');
    expect(v?.id).toBe('v1');
  });
});

