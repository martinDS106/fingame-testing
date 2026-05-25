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
import {
  localeBannerAlignStyle,
  localeIconRowStyle,
  localeTextBesideIconStyle,
  localeTrailingGroupRowStyle,
  rtlRootDirection,
  rtlRowMerge,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { useContentStore } from '@/stores';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);

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
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader
          title={t('course.titleFallback')}
          showBack
          showBell={false}
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600" style={ta}>
            {t('course.notFound')}
          </Text>
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
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader title={course.title} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={[
          { padding: 16, paddingBottom: 100, gap: 16 },
          rtlRootDirection(rtl),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {showSkeleton ? (
          <>
            <Card>
              <Skeleton className="h-4 w-40 mb-3" />
              <Skeleton className="h-2 w-full rounded-full" />
              <View style={rtlRowMerge(rtl, { gap: 12, marginTop: 16 })}>
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
                  <View key={i} style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12 })}>
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
            <Text className="text-gray-800 font-semibold mb-1" style={ta}>
              {t('course.noLessonsFound')}
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-4" style={ta}>
              {t('course.syncToSeeLessons')}
            </Text>
            <Button variant="primary" onPress={() => void syncFromCloud()}>
              {t('course.syncNow')}
            </Button>
          </Card>
        ) : null}

        {syncStatus === 'error' && (
          <Card className="bg-red-50 border border-red-200">
            <Text className="text-red-900 font-semibold mb-1" style={ta}>
              {t('course.couldNotRefresh')}
            </Text>
            <Text className="text-sm text-red-800 mb-3" style={ta}>
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
              <View style={rtlRowMerge(rtl, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 })}>
                <Text className="text-white text-sm" style={ta}>
                  {t('course.courseProgress')}
                </Text>
                <Text className="text-white font-semibold text-sm" style={ta}>
                  {t('course.completePct', { pct: percent })}
                </Text>
              </View>
              <ProgressBar
                value={percent}
                height={6}
                trackClassName="bg-white/20"
                color={colors.accent[400]}
              />
              <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 16, marginTop: 12 })}>
                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 4 })}>
                  <CheckCircle size={14} color={colors.white} />
                  <Text className="text-white text-sm" style={ta}>
                    {t('course.lessonsCount', {
                      done: completedCount,
                      total: lessons.length,
                    })}
                  </Text>
                </View>
                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 4 })}>
                  <Award size={14} color={colors.accent[300]} />
                  <Text className="text-sm font-semibold text-accent-300" style={ta}>
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
                  <Text className="text-white text-lg font-semibold" style={ta}>
                    {nextLesson.title}
                  </Text>
                  <Text className="text-primary-100 text-sm" style={ta}>
                    {t('course.minutes', { n: nextLesson.durationMinutes })}
                  </Text>
                </LinearGradient>
                <View className="p-4">
                  <Text className="text-gray-600 mb-4" style={ta}>
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
              <View style={localeBannerAlignStyle(rtl)} className="mb-3">
                <Text
                  style={[ta, { alignSelf: 'stretch' }]}
                  className="text-lg text-gray-800 font-semibold"
                >
                  {t('course.courseContent')}
                </Text>
              </View>
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
                      <View
                        style={[localeIconRowStyle(rtl), { alignItems: 'center', gap: 12 }]}
                      >
                        {done && (
                          <Badge variant="success">{t('course.done')}</Badge>
                        )}
                        <View style={localeTextBesideIconStyle(rtl)}>
                          <Text
                            style={[ta, { alignSelf: 'stretch' }]}
                            className="text-sm text-gray-900 font-medium"
                          >
                            {lesson.title}
                          </Text>
                          <View
                            style={[
                              localeIconRowStyle(rtl),
                              { alignItems: 'center', gap: 4, marginTop: 2 },
                            ]}
                          >
                            <Text style={[ta, { alignSelf: 'stretch' }]} className="text-xs text-gray-500">
                              {t('course.minShort', { n: lesson.durationMinutes })}
                            </Text>
                            <Clock size={12} color={colors.gray[500]} />
                          </View>
                        </View>
                        <View
                          className="w-10 h-10 rounded-lg items-center justify-center shrink-0"
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
                <View style={localeTrailingGroupRowStyle(rtl)}>
                  <Text className="text-4xl">🎁</Text>
                  <View style={localeTextBesideIconStyle(rtl)}>
                    <View
                      style={[
                        localeIconRowStyle(rtl),
                        { alignItems: 'center', gap: 8, marginBottom: 4 },
                      ]}
                    >
                      <Text
                        style={[ta, { alignSelf: 'stretch' }]}
                        className="text-primary-900 font-semibold"
                      >
                        {t('course.completedTitle')}
                      </Text>
                      <Award size={20} color={colors.primary[900]} />
                    </View>
                    <Text
                      style={[ta, { alignSelf: 'stretch' }]}
                      className="text-sm text-primary-800"
                    >
                      {t('course.completedBody', { n: course.coinReward })}
                    </Text>
                  </View>
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
