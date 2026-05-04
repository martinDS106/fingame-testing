import { create } from 'zustand';

import { isApiConfigured } from '@/lib/api';
import {
  addFinTokComment,
  pullFinTokComments,
  pullFinTokLikeIds,
  pullFinTokSaveIds,
  pullFinTokVideos,
  setFinTokLike,
  setFinTokSave,
  type RemoteFinTokComment,
  type RemoteFinTokVideo,
} from '@/lib/syncServiceApi';

export interface FinTokVideo extends RemoteFinTokVideo {
  resolved_url: string;
}

interface FinTokState {
  loading: boolean;
  videos: FinTokVideo[];
  likedIds: string[];
  savedIds: string[];
  commentsByVideoId: Record<string, RemoteFinTokComment[]>;
  refreshingCommentsForId: string | null;
  lastError: string | null;

  refresh: (userId?: string | null) => Promise<void>;
  refreshComments: (videoId: string) => Promise<void>;
  toggleLike: (userId: string | null, videoId: string) => Promise<void>;
  toggleSave: (userId: string | null, videoId: string) => Promise<void>;
  addComment: (userId: string | null, videoId: string, body: string) => Promise<void>;
}

function resolvePublicUrl(row: RemoteFinTokVideo): string {
  if (row.video_url) return row.video_url;
  // Supabase storage is not supported in MySQL API mode.
  void isApiConfigured;
  return '';
}

export const useFintokStore = create<FinTokState>((set, get) => ({
  loading: false,
  videos: [],
  likedIds: [],
  savedIds: [],
  commentsByVideoId: {},
  refreshingCommentsForId: null,
  lastError: null,

  refresh: async (userId) => {
    set({ loading: true });
    try {
      if (isApiConfigured) {
        set({
          videos: [],
          likedIds: [],
          savedIds: [],
          lastError:
            'FinTok is not available in MySQL API mode yet.',
        });
        return;
      }

      const raw = (await pullFinTokVideos(200)) as RemoteFinTokVideo[];
      const videos: FinTokVideo[] = raw
        .filter((v) => v.is_published)
        .map((v) => ({ ...v, resolved_url: resolvePublicUrl(v) }));

      set({ videos, lastError: null });

      if (userId) {
        const [likes, saves] = await Promise.all([
          pullFinTokLikeIds(userId),
          pullFinTokSaveIds(userId),
        ]);
        set({ likedIds: likes, savedIds: saves });
      } else {
        set({ likedIds: [], savedIds: [] });
      }
    } finally {
      set({ loading: false });
    }
  },

  refreshComments: async (videoId) => {
    set({ refreshingCommentsForId: videoId });
    try {
      const comments = await pullFinTokComments(videoId, 200);
      set((s) => ({
        commentsByVideoId: { ...s.commentsByVideoId, [videoId]: comments },
      }));
    } finally {
      set({ refreshingCommentsForId: null });
    }
  },

  toggleLike: async (userId, videoId) => {
    if (!userId) return;
    const liked = get().likedIds.includes(videoId);
    set((s) => ({
      likedIds: liked ? s.likedIds.filter((id) => id !== videoId) : [...s.likedIds, videoId],
    }));
    const res = await setFinTokLike(userId, videoId, !liked);
    if (!res.ok) {
      // revert
      set((s) => ({
        likedIds: liked ? [...s.likedIds, videoId] : s.likedIds.filter((id) => id !== videoId),
      }));
    }
  },

  toggleSave: async (userId, videoId) => {
    if (!userId) return;
    const saved = get().savedIds.includes(videoId);
    set((s) => ({
      savedIds: saved ? s.savedIds.filter((id) => id !== videoId) : [...s.savedIds, videoId],
    }));
    const res = await setFinTokSave(userId, videoId, !saved);
    if (!res.ok) {
      // revert
      set((s) => ({
        savedIds: saved ? [...s.savedIds, videoId] : s.savedIds.filter((id) => id !== videoId),
      }));
    }
  },

  addComment: async (userId, videoId, body) => {
    if (!userId) return;
    const res = await addFinTokComment(userId, videoId, body);
    if (!res.ok) return;
    await get().refreshComments(videoId);
  },
}));

