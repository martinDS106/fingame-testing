import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  Share,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  Bookmark,
  Heart,
  MessageCircle,
  Play,
  Share2,
  TrendingUp,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';
import { useFintokStore, useUserStore } from '@/stores';
import { rewardFor } from '@/lib/rewards';
import { useT } from '@/hooks/useT';
import { useLocaleStore } from '@/stores/useLocaleStore';

const BOTTOM_NAV_HEIGHT = 72;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = SCREEN_HEIGHT;

interface VideoItemProps {
  videoId: string;
  activeVideoId: string | null;
  forceActive?: boolean;
}

const EMPTY_COMMENTS: { id: string; video_id: string; user_id: string; body: string; created_at: string }[] =
  [];

function ActiveVideo({ url, isActive }: { url: string; isActive: boolean }) {
  const [probe, setProbe] = useState<{ ok: boolean; status?: number; err?: string } | null>(
    null
  );
  const [status, setStatus] = useState<string>('loading');
  const [playerErr, setPlayerErr] = useState<string | null>(null);

  function fmtErr(e: unknown): string {
    if (!e) return 'Unknown';
    if (typeof e === 'string') return e;
    if (e instanceof Error) return `${e.name}: ${e.message}`;
    try {
      return JSON.stringify(e, null, 2);
    } catch {
      return String(e);
    }
  }

  function safeOneLine(s: string): string {
    return s.replace(/\s+/g, ' ').trim();
  }
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = false;
    p.pause();
  });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (cancelled) return;
        setProbe({ ok: res.ok, status: res.status });
      } catch (e) {
        if (cancelled) return;
        setProbe({ ok: false, err: e instanceof Error ? e.message : 'Network error' });
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (!url) return;
    const sub = player.addListener('statusChange', (event) => {
      setStatus(event.status);
      if (event.error) setPlayerErr(fmtErr(event.error));
    });
    return () => {
      sub.remove();
    };
  }, [player, url]);

  useEffect(() => {
    if (!url) return;
    try {
      if (isActive) {
        player.play();
        // Some iOS builds need a tick after mount.
        setTimeout(() => {
          try {
            player.play();
          } catch {
            // ignore
          }
        }, 250);
      }
      else player.pause();
    } catch {
      // ignore
    }
  }, [isActive, player, url]);

  if (!url) return null;

  return (
    <>
      <Pressable
        style={{ position: 'absolute', inset: 0 }}
        onPress={() => {
          try {
            // Toggle play/pause for manual debugging.
            if (status === 'playing') player.pause();
            else player.play();
          } catch {
            // ignore
          }
        }}
      >
        <VideoView
          player={player}
          style={{ position: 'absolute', inset: 0 }}
          contentFit="cover"
          nativeControls={false}
        />
      </Pressable>

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: 86,
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderRadius: 12,
          backgroundColor: 'rgba(0,0,0,0.35)',
        }}
      >
        <Text className="text-white/90 text-xs" numberOfLines={1}>
          status: {status}
        </Text>
        {!!playerErr && (
          <Text className="text-white/90 text-xs" numberOfLines={4}>
            error: {safeOneLine(playerErr)}
          </Text>
        )}
      </View>
      {probe && !probe.ok && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: 120,
            padding: 12,
            borderRadius: 12,
            backgroundColor: 'rgba(0,0,0,0.65)',
          }}
        >
          <Text className="text-white font-semibold">Video not playable</Text>
          <Text className="text-white/80 text-xs">
            {probe.status != null ? `HTTP ${probe.status}` : probe.err || 'Unknown error'}
          </Text>
        </View>
      )}
    </>
  );
}

function VideoItem({ videoId, activeVideoId, forceActive }: VideoItemProps) {
  const isActive = forceActive ? true : videoId === activeVideoId;
  const { t } = useT();
  const locale = useLocaleStore((s) => s.locale);
  const remoteUserId = useUserStore((s) => s.remoteUserId);

  const videos = useFintokStore((s) => s.videos);
  const video = useMemo(
    () => videos.find((v) => v.id === videoId) ?? null,
    [videos, videoId]
  );
  const likedIds = useFintokStore((s) => s.likedIds);
  const savedIds = useFintokStore((s) => s.savedIds);
  const toggleLike = useFintokStore((s) => s.toggleLike);
  const toggleSave = useFintokStore((s) => s.toggleSave);
  const refreshComments = useFintokStore((s) => s.refreshComments);
  const addComment = useFintokStore((s) => s.addComment);
  const commentsByVideoId = useFintokStore((s) => s.commentsByVideoId);
  const comments = commentsByVideoId[videoId] ?? EMPTY_COMMENTS;

  const liked = likedIds.includes(videoId);
  const saved = savedIds.includes(videoId);

  const title = useMemo(() => {
    if (!video) return '';
    return locale === 'ar' ? video.title_ar || video.title : video.title;
  }, [video, locale]);

  const caption = useMemo(() => {
    if (!video) return '';
    const raw =
      locale === 'ar' ? video.caption_ar || video.caption : video.caption;
    return raw || '';
  }, [video, locale]);

  const creatorName = useMemo(() => {
    if (!video) return '';
    return locale === 'ar'
      ? video.creator_name_ar || video.creator_name
      : video.creator_name;
  }, [video, locale]);

  const sourceUrl = video?.resolved_url ?? '';

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');

  async function openComments() {
    setCommentsOpen(true);
    await refreshComments(videoId);
  }

  async function submitComment() {
    if (!remoteUserId) {
      Alert.alert('Sign in required', 'Please sign in to comment.');
      return;
    }
    const body = commentDraft.trim();
    if (!body) return;
    setCommentDraft('');
    await addComment(remoteUserId, videoId, body);
  }

  async function share() {
    if (!video) return;
    try {
      const url = video.resolved_url || video.video_url || '';
      const message = url ? `${title}\n${url}` : title;
      const res = await Share.share({ message });
      if ((res as any)?.action === (Share as any).dismissedAction) return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Share failed.';
      Alert.alert('Share', msg);
    }
  }

  if (!video) {
    return <View style={{ height: ITEM_HEIGHT, backgroundColor: '#000' }} />;
  }

  return (
    <View style={{ height: ITEM_HEIGHT, backgroundColor: '#000' }}>
      {sourceUrl && isActive ? (
        <ActiveVideo url={sourceUrl} isActive={isActive} />
      ) : (
        <LinearGradient
          colors={[colors.gray[900], colors.gray[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Play size={80} color="rgba(255,255,255,0.8)" />
        </LinearGradient>
      )}

      <View
        pointerEvents="box-none"
        className="absolute right-3 flex-col gap-5 items-center"
        style={{ bottom: BOTTOM_NAV_HEIGHT + 140, zIndex: 50, elevation: 50 }}
      >
        <Pressable
          onPress={() => {
            if (!remoteUserId) {
              Alert.alert('Sign in required', 'Please sign in to like videos.');
              return;
            }
            void toggleLike(remoteUserId, videoId);
          }}
          className="items-center gap-1"
          hitSlop={6}
        >
          <View
            className={`w-12 h-12 rounded-full items-center justify-center ${
              liked ? 'bg-red-500' : ''
            }`}
            style={!liked ? { backgroundColor: 'rgba(255,255,255,0.2)' } : {}}
          >
            <Heart
              size={22}
              color={colors.white}
              fill={liked ? colors.white : 'transparent'}
            />
          </View>
          <Text className="text-white text-xs">{liked ? 'Liked' : 'Like'}</Text>
        </Pressable>

        <Pressable
          className="items-center gap-1"
          hitSlop={6}
          onPress={() => {
            if (!remoteUserId) {
              Alert.alert('Sign in required', 'Please sign in to comment.');
              return;
            }
            void openComments();
          }}
        >
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <MessageCircle size={22} color={colors.white} />
          </View>
          <Text className="text-white text-xs">{formatNumber(comments.length)}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (!remoteUserId) {
              Alert.alert('Sign in required', 'Please sign in to save videos.');
              return;
            }
            void toggleSave(remoteUserId, videoId);
          }}
          className="items-center gap-1"
          hitSlop={6}
        >
          <View
            className={`w-12 h-12 rounded-full items-center justify-center ${
              saved ? 'bg-accent-500' : ''
            }`}
            style={!saved ? { backgroundColor: 'rgba(255,255,255,0.2)' } : {}}
          >
            <Bookmark
              size={22}
              color={colors.white}
              fill={saved ? colors.white : 'transparent'}
            />
          </View>
          <Text className="text-white text-xs">{t('fintok.save')}</Text>
        </Pressable>

        <Pressable
          className="items-center gap-1"
          hitSlop={12}
          onPress={() => {
            void share();
          }}
          style={{ zIndex: 60 }}
        >
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Share2 size={22} color={colors.white} />
          </View>
          <Text className="text-white text-xs">Share</Text>
        </Pressable>
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: BOTTOM_NAV_HEIGHT,
          paddingHorizontal: 16,
          paddingTop: 48,
          paddingBottom: 16,
        }}
      >
        <View className="flex-row items-center gap-3 mb-3 pr-20">
          <LinearGradient
            colors={[colors.accent[400], '#fb923c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text className="text-lg">{video.creator_avatar}</Text>
          </LinearGradient>
          <View className="flex-1">
            <Text className="text-white text-sm font-semibold">
              {creatorName}
            </Text>
            <Text className="text-white/60 text-xs">
              {t('fintok.finEducator')}
            </Text>
          </View>
          <Button variant="accent" size="sm">
            {t('fintok.follow')}
          </Button>
        </View>

        <Text className="text-white text-lg font-semibold mb-3 pr-20">
          {title}
        </Text>

        {!!caption && (
          <Text className="text-white/80 text-sm mb-3 pr-20" numberOfLines={3}>
            {caption}
          </Text>
        )}

        <View className="pr-20 mb-2">
          <Button
            variant="accent"
            fullWidth
            leftIcon={<TrendingUp size={16} color={colors.primary[900]} />}
            onPress={() =>
              router.push((video.simulation_route || '/simulation-hub') as never)
            }
          >
            {t('fintok.trySimulation')}
          </Button>
        </View>

        <View className="flex-row gap-2 pr-20">
          <View
            className="px-2 py-0.5 rounded-md border"
            style={{
              backgroundColor: 'rgba(250, 204, 21, 0.2)',
              borderColor: 'rgba(250, 204, 21, 0.3)',
            }}
          >
            <Text className="text-xs text-accent-300 font-medium">
              {t('fintok.coinsForWatching', { n: 5 })}
            </Text>
          </View>
          <View
            className="px-2 py-0.5 rounded-md border"
            style={{
              backgroundColor: 'rgba(96, 165, 250, 0.2)',
              borderColor: 'rgba(96, 165, 250, 0.3)',
            }}
          >
            <Text className="text-xs text-primary-300 font-medium">
              {t('fintok.xpBonus', { n: 10 })}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <Modal
        visible={commentsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentsOpen(false)}
      >
        <View
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          className="justify-end"
        >
          <View
            style={{
              maxHeight: '70%',
              backgroundColor: '#fff',
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: 14,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-900 font-semibold">Comments</Text>
              <Pressable onPress={() => setCommentsOpen(false)} hitSlop={10}>
                <Text className="text-gray-600">Close</Text>
              </Pressable>
            </View>

            <View style={{ gap: 8 }}>
              {comments.length === 0 ? (
                <Card className="bg-gray-50 border border-gray-200">
                  <Text className="text-sm text-gray-700">
                    No comments yet. Be the first.
                  </Text>
                </Card>
              ) : (
                <View style={{ gap: 10 }}>
                  {comments.slice(0, 30).map((c) => (
                    <View key={c.id} className="border-b border-gray-100 pb-2">
                      <Text className="text-sm text-gray-900">{c.body}</Text>
                      <Text className="text-xs text-gray-500">{c.created_at}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View className="mt-3 flex-row items-center gap-2">
              <View className="flex-1">
                <TextInput
                  value={commentDraft}
                  onChangeText={setCommentDraft}
                  placeholder="Write a comment…"
                  placeholderTextColor="#9ca3af"
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                />
              </View>
              <Button onPress={submitComment} size="sm">
                Send
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function FinTokScreen() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const { startId } = useLocalSearchParams<{ startId?: string }>();
  const watchedIds = useState(() => new Set<string>())[0];
  const addCoins = useUserStore((s) => s.addCoins);
  const addXP = useUserStore((s) => s.addXP);
  const { t } = useT();
  const remoteUserId = useUserStore((s) => s.remoteUserId);

  const loading = useFintokStore((s) => s.loading);
  const lastError = useFintokStore((s) => s.lastError);
  const videos = useFintokStore((s) => s.videos);
  const data = useMemo(() => videos.map((v) => ({ id: v.id })), [videos]);
  const initialIndex = useMemo(() => {
    if (!startId) return 0;
    const idx = data.findIndex((d) => d.id === startId);
    return idx >= 0 ? idx : 0;
  }, [data, startId]);

  useEffect(() => {
    void useFintokStore.getState().refresh(remoteUserId);
  }, [remoteUserId]);

  // Ensure we have an active video once data is available.
  useEffect(() => {
    if (activeVideoId) return;
    if (data.length === 0) return;
    const id = data[Math.min(initialIndex, data.length - 1)]?.id;
    if (id) setActiveVideoId(id);
  }, [activeVideoId, data, initialIndex]);

  const onScrollEnd = useRef((y: number) => {
    if (data.length === 0) return;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(y / ITEM_HEIGHT)));
    const id = data[idx]?.id;
    if (!id) return;

    setActiveVideoId((prev) => (prev === id ? prev : id));
    if (!watchedIds.has(id)) {
      void (async () => {
        const reward = rewardFor('watch_video');
        const okCoins = await addCoins(reward.coins, 'watch_video');
        if (!okCoins) {
          Alert.alert(
            'Could not save reward',
            'Your watch progress was not saved. Please sign in again and retry.',
          );
          return;
        }
        const okXp = await addXP(reward.xp);
        if (!okXp) {
          await useUserStore.getState().spendCoins(reward.coins, 'watch_video');
          Alert.alert(
            'Could not save XP',
            'Coins were saved, but XP did not sync. Please try again.',
          );
          return;
        }
        watchedIds.add(id);
      })();
    }
  }).current;

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VideoItem
            videoId={item.id}
            activeVideoId={activeVideoId}
            forceActive={activeVideoId == null && index === initialIndex}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          onScrollEnd(e.nativeEvent.contentOffset.y);
        }}
        ListEmptyComponent={
          <View style={{ height: ITEM_HEIGHT }} className="items-center justify-center">
            <Text className="text-white/80" style={{ paddingHorizontal: 18, textAlign: 'center' }}>
              {loading
                ? 'Loading…'
                : lastError
                  ? lastError
                  : 'No videos yet.'}
            </Text>
          </View>
        }
      />

      <SafeAreaView
        edges={['top']}
        className="absolute top-0 left-0 right-0 px-4 pt-2"
      >
        <Text className="text-white text-2xl font-bold text-center">
          {t('fintok.title')}
        </Text>
      </SafeAreaView>

      <BottomNav />
    </View>
  );
}
