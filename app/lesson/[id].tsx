import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Clock, Film } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { useContentStore } from '@/stores';

export default function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const allLessons = useContentStore((s) => s.lessons);
  const allVideos = useContentStore((s) => s.videos);
  const completedLessons = useContentStore((s) => s.completedLessons);
  const watchedVideos = useContentStore((s) => s.watchedVideos);
  const markVideoWatched = useContentStore((s) => s.markVideoWatched);
  const completeLesson = useContentStore((s) => s.completeLesson);
  const syncFromCloud = useContentStore((s) => s.syncFromCloud);

  useEffect(() => {
    void syncFromCloud();
  }, [syncFromCloud]);

  const lesson = useMemo(
    () => allLessons.find((l) => l.id === id),
    [allLessons, id]
  );
  const video = useMemo(
    () =>
      allVideos
        .filter((v) => v.lessonId === id)
        .sort((a, b) => a.sortOrder - b.sortOrder)[0],
    [allVideos, id]
  );

  const alreadyCompleted = !!lesson && completedLessons.includes(lesson.id);
  const alreadyWatched = !!video && watchedVideos.includes(video.id);

  // expo-video requires a non-null source. Empty string is safer than null.
  const player = useVideoPlayer(video?.url ?? '', (p) => {
    p.loop = false;
    p.muted = false;
    if (video?.url) {
      p.play();
    }
  });

  const [watchedSec, setWatchedSec] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<string>('loading');
  const awardedRef = useRef(false);

  // Listen to status and error events on the player.
  useEffect(() => {
    if (!video?.url) return;

    const statusSub = player.addListener('statusChange', (event) => {
      setStatus(event.status);
      if (event.error) {
        console.warn('[video] error', event.error);
      }
    });

    return () => {
      statusSub.remove();
    };
  }, [player, video?.url]);

  // Poll playback position every second.
  useEffect(() => {
    if (!video) return;

    const interval = setInterval(() => {
      try {
        const t = player.currentTime ?? 0;
        const total = player.duration ?? video.durationSeconds;
        setWatchedSec(t);
        if (total > 0) setDuration(total);

        if (!awardedRef.current && total > 0 && t / total >= 0.9) {
          awardedRef.current = true;
          markVideoWatched(video.id, video.lessonId);
        }
      } catch (err) {
        console.warn('[video] poll error', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, video, markVideoWatched]);

  if (!lesson) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Lesson" showBack showBell={false} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Lesson not found</Text>
          <Button
            variant="outline"
            className="mt-3"
            onPress={() => router.back()}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  const progressPct =
    duration > 0 ? Math.min(100, (watchedSec / duration) * 100) : 0;

  const handleManualComplete = () => {
    completeLesson(lesson.id, 10);
    Alert.alert('Lesson complete', '+10 coins');
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={lesson.title} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {video ? (
          <Card padded={false} className="overflow-hidden">
            <VideoView
              style={{ width: '100%', aspectRatio: 16 / 9 }}
              player={player}
              fullscreenOptions={{ enable: true }}
              allowsPictureInPicture
              contentFit="contain"
              nativeControls
            />
            <View className="p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Film size={16} color={colors.primary[600]} />
                <Text className="text-sm text-primary-700 font-semibold flex-1">
                  {video.title}
                </Text>
                {alreadyWatched && (
                  <View className="flex-row items-center gap-1">
                    <CheckCircle size={14} color="#16a34a" />
                    <Text className="text-xs text-green-700 font-semibold">
                      Watched
                    </Text>
                  </View>
                )}
              </View>
              <ProgressBar
                value={progressPct}
                height={6}
                gradient={[colors.primary[500], colors.primary[700]]}
              />
              <View className="flex-row justify-between mt-2">
                <Text className="text-xs text-gray-500">
                  {formatTime(watchedSec)} /{' '}
                  {formatTime(duration || video.durationSeconds)}
                </Text>
                <Text className="text-xs text-gray-500">
                  {progressPct.toFixed(0)}% watched · {status}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-3 text-center">
                Use the player controls. Watch 90%+ to auto-complete.
              </Text>
            </View>
          </Card>
        ) : (
          <Card className="items-center py-8">
            <Film size={36} color={colors.gray[400]} />
            <Text className="text-sm text-gray-600 mt-3 text-center">
              No video attached to this lesson yet. You can still mark it as
              complete.
            </Text>
          </Card>
        )}

        <LinearGradient
          colors={[colors.primary[600], colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16, padding: 16 }}
        >
          <Text className="text-white font-semibold mb-1">{lesson.title}</Text>
          <Text className="text-primary-100 text-sm">{lesson.summary}</Text>
          <View className="flex-row items-center gap-1 mt-2">
            <Clock size={14} color={colors.white} />
            <Text className="text-white text-xs">
              {lesson.durationMinutes} min
            </Text>
          </View>
        </LinearGradient>

        {alreadyCompleted ? (
          <View className="bg-green-50 border border-green-200 rounded-xl p-4 flex-row items-center gap-2">
            <CheckCircle size={20} color="#16a34a" />
            <Text className="text-green-800 font-medium flex-1">
              You've already completed this lesson.
            </Text>
          </View>
        ) : (
          <Button variant="outline" fullWidth onPress={handleManualComplete}>
            Mark as Complete (+10 coins)
          </Button>
        )}
      </ScrollView>
    </View>
  );
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}
