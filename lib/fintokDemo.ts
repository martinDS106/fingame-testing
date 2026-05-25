import type { RemoteFinTokVideo } from '@/lib/syncServiceApi';

export type FinTokVideoFeedItem = RemoteFinTokVideo & { resolved_url: string };

/** Curated demo feed when Supabase FinTok is unavailable (e.g. Nest API mode). */
export const FINTOK_DEMO_VIDEOS: FinTokVideoFeedItem[] = [
  {
    id: 'demo-fintok-budget',
    title: '5 quick budgeting tips',
    title_ar: '٥ نصائح سريعة للميزانية',
    creator_name: 'Fin-Game Team',
    creator_name_ar: 'فريق Fin-Game',
    creator_avatar: '👩‍🏫',
    caption: 'Save 10% first, then spend the rest.',
    caption_ar: 'وفّر ١٠٪ الأول وبعدها اصرف الباقي.',
    tags: ['budget', 'tips'],
    simulation_route: '/simulation/banking',
    storage_path: 'demo/budgeting.mp4',
    video_url:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration_seconds: 15,
    sort_order: 1,
    is_published: true,
    created_at: '',
    updated_at: '',
    resolved_url:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'demo-fintok-risk',
    title: 'Risk vs return in 30 seconds',
    title_ar: 'المخاطرة مقابل العائد في ٣٠ ثانية',
    creator_name: 'Fin-Game Team',
    creator_name_ar: 'فريق Fin-Game',
    creator_avatar: '👨‍🏫',
    caption: 'Higher return usually comes with higher risk.',
    caption_ar: 'العائد الأعلى غالبًا معاه مخاطرة أعلى.',
    tags: ['investing', 'basics'],
    simulation_route: '/simulation/investment',
    storage_path: 'demo/risk-return.mp4',
    video_url:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration_seconds: 20,
    sort_order: 2,
    is_published: true,
    created_at: '',
    updated_at: '',
    resolved_url:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 'demo-fintok-credit',
    title: 'Credit score basics',
    title_ar: 'أساسيات التصنيف الائتماني',
    creator_name: 'Fin-Game Team',
    creator_name_ar: 'فريق Fin-Game',
    creator_avatar: '🧑‍💻',
    caption: 'Pay on time and keep utilization low.',
    caption_ar: 'اسدد في الميعاد وخلّي نسبة الاستخدام قليلة.',
    tags: ['credit'],
    simulation_route: '/simulation/credit',
    storage_path: 'demo/credit-score.mp4',
    video_url:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration_seconds: 30,
    sort_order: 3,
    is_published: true,
    created_at: '',
    updated_at: '',
    resolved_url:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
];
