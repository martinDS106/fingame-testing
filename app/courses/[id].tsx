import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  CheckCircle,
  Clock,
  Play,
} from 'lucide-react-native';

import { BottomNav } from '@/components/BottomNav';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors } from '@/theme';
import { useContentStore } from '@/stores';
import { useT } from '@/hooks/useT';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useT();

  const allCourses = useContentStore((s) => s.courses);
  const allLessons = useContentStore((s) => s.lessons);
  const allVideos = useContentStore((s) => s.videos);
  const loaded = useContentStore((s) => s.loaded);
  const syncStatus = useContentStore((s) => s.syncStatus);
  const syncError = useContentStore((s) => s.syncError);
  const syncFromCloud = useContentStore((s) => s.syncFromCloud);
  const completedLessons = useContentStore((s) => s.completedLessons);

  const hasVideo = (lessonId: string) =>
    allVideos.some((v) => v.lessonId === lessonId);

  const openLesson = (lessonId: string) => {
    router.push(`/lesson/${lessonId}` as never);
  };

  const course = useMemo(
    () => allCourses.find((c) => c.id === id),
    [allCourses, id]
  );
  const lessons = useMemo(
    () =>
      allLessons
        .filter((l) => l.courseId === id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allLessons, id]
  );

  if (!course) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader
          title={t('course.titleFallback')}
          showBack
          showBell={false}
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">{t('course.notFound')}</Text>
          <Button
            variant="outline"
            className="mt-3"
            onPress={() => router.back()}
          >
            {t('course.goBack')}
          </Button>
        </View>
      </View>
    );
  }

  const completedCount = lessons.filter((l) =>
    completedLessons.includes(l.id)
  ).length;
  const percent =
    lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;
  const nextLesson = lessons.find((l) => !completedLessons.includes(l.id));
  const showSkeleton = syncStatus === 'syncing' || !loaded;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={course.title} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {showSkeleton ? (
          <>
            <Card>
              <Skeleton className="h-4 w-40 mb-3" />
              <Skeleton className="h-2 w-full rounded-full" />
              <View className="flex-row gap-3 mt-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </View>
            </Card>
            <Card padded={false} className="overflow-hidden">
              <Skeleton className="h-[180px] rounded-none" />
              <View className="p-4 gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-10 w-full rounded-xl mt-2" />
              </View>
            </Card>
            <Card>
              <Skeleton className="h-4 w-44 mb-3" />
              <View className="gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} className="flex-row items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <View className="flex-1 gap-2">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-24" />
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </>
        ) : lessons.length === 0 ? (
          <Card className="items-center py-8">
            <Text className="text-gray-800 font-semibold mb-1">
              {t('course.noLessonsFound')}
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-4">
              {t('course.syncToSeeLessons')}
            </Text>
            <Button variant="primary" onPress={() => void syncFromCloud()}>
              {t('course.syncNow')}
            </Button>
          </Card>
        ) : null}

        {syncStatus === 'error' && (
          <Card className="bg-red-50 border border-red-200">
            <Text className="text-red-900 font-semibold mb-1">
              {t('course.couldNotRefresh')}
            </Text>
            <Text className="text-sm text-red-800 mb-3">
              {syncError ?? t('common.unknownError')}
            </Text>
            <Button variant="outline" onPress={() => void syncFromCloud()}>
              {t('action.retry')}
            </Button>
          </Card>
        )}

        {!showSkeleton && lessons.length > 0 && (
          <>
            <LinearGradient
          colors={[colors.primary[600], colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16, padding: 16 }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-sm">{t('course.courseProgress')}</Text>
            <Text className="text-white font-semibold text-sm">
              {t('course.completePct', { pct: percent })}
            </Text>
          </View>
          <ProgressBar
            value={percent}
            height={6}
            trackClassName="bg-white/20"
            color={colors.accent[400]}
          />
          <View className="flex-row items-center gap-4 mt-3">
            <View className="flex-row items-center gap-1">
              <CheckCircle size={14} color={colors.white} />
              <Text className="text-white text-sm">
                {t('course.lessonsCount', {
                  done: completedCount,
                  total: lessons.length,
                })}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Award size={14} color={colors.accent[300]} />
              <Text className="text-sm font-semibold text-accent-300">
                {t('course.coinsOnCompletion', { n: course.coinReward })}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {nextLesson && (
          <Card padded={false} className="overflow-hidden border-2 border-primary-200">
            <LinearGradient
              colors={[course.color, colors.primary[700]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                height: 180,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Play size={40} color={colors.white} fill={colors.white} />
              </View>
              <Text className="text-white text-lg font-semibold">
                {nextLesson.title}
              </Text>
              <Text className="text-primary-100 text-sm">
                {t('course.minutes', { n: nextLesson.durationMinutes })}
              </Text>
            </LinearGradient>
            <View className="p-4">
              <Text className="text-gray-600 mb-4">
                {nextLesson.summary}
              </Text>
              <Button
                variant="primary"
                fullWidth
                leftIcon={
                  <Play size={16} color={colors.white} fill={colors.white} />
                }
                onPress={() => openLesson(nextLesson.id)}
              >
                {hasVideo(nextLesson.id)
                  ? t('course.watchLesson')
                  : t('course.completeLessonBonus', { n: 10 })}
              </Button>
            </View>
          </Card>
        )}

        <View>
          <Text className="text-lg text-gray-800 font-semibold mb-3">
            {t('course.courseContent')}
          </Text>
          <View className="gap-2">
            {lessons.map((lesson) => {
              const done = completedLessons.includes(lesson.id);
              const isNext = lesson.id === nextLesson?.id;

              return (
                <PressableCard
                  key={lesson.id}
                  onPress={() => openLesson(lesson.id)}
                  className={
                    isNext ? 'border-2 border-primary-500 bg-primary-50' : ''
                  }
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center"
                      style={{
                        backgroundColor: done ? '#dcfce7' : colors.primary[100],
                      }}
                    >
                      {done ? (
                        <CheckCircle size={20} color="#16a34a" />
                      ) : (
                        <Play size={20} color={colors.primary[600]} />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-gray-900 font-medium">
                        {lesson.title}
                      </Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Clock size={12} color={colors.gray[500]} />
                        <Text className="text-xs text-gray-500">
                          {t('course.minShort', { n: lesson.durationMinutes })}
                        </Text>
                      </View>
                    </View>
                    {done && (
                      <Badge variant="success">{t('course.done')}</Badge>
                    )}
                  </View>
                </PressableCard>
              );
            })}
          </View>
        </View>

        {percent === 100 && (
          <LinearGradient
            colors={[colors.accent[400], colors.accent[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, padding: 16 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Award size={20} color={colors.primary[900]} />
                  <Text className="text-primary-900 font-semibold">
                    {t('course.completedTitle')}
                  </Text>
                </View>
                <Text className="text-sm text-primary-800">
                  {t('course.completedBody', { n: course.coinReward })}
                </Text>
              </View>
              <Text className="text-4xl">🎁</Text>
            </View>
          </LinearGradient>
        )}
          </>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
