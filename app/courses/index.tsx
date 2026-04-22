import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, BookOpen, ChevronRight, Clock } from 'lucide-react-native';

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

export default function CoursesScreen() {
  const router = useRouter();
  const { t } = useT();
  const courses = useContentStore((s) => s.courses);
  const lessons = useContentStore((s) => s.lessons);
  const loaded = useContentStore((s) => s.loaded);
  const syncStatus = useContentStore((s) => s.syncStatus);
  const syncError = useContentStore((s) => s.syncError);
  const syncFromCloud = useContentStore((s) => s.syncFromCloud);
  const completedLessons = useContentStore((s) => s.completedLessons);
  const [topic, setTopic] = useState<string>('all');

  useEffect(() => {
    void syncFromCloud();
  }, [syncFromCloud]);

  const overall = computeOverallProgress(courses, lessons, completedLessons);
  const showSkeleton = syncStatus === 'syncing' || !loaded;

  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const c of courses) set.add(c.topic || 'investing');
    return ['all', ...Array.from(set).sort()];
  }, [courses]);

  const visibleCourses = useMemo(() => {
    if (topic === 'all') return courses;
    return courses.filter((c) => (c.topic || 'investing') === topic);
  }, [courses, topic]);

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={t('courses.title')} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary[600], colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16, padding: 16 }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-sm">{t('courses.overallProgress')}</Text>
            {!showSkeleton ? (
              <Text className="text-white font-semibold text-sm">
                {t('courses.completePct', { pct: overall.percent })}
              </Text>
            ) : (
              <Skeleton className="h-4 w-20 bg-white/30" />
            )}
          </View>
          <ProgressBar
            value={!showSkeleton ? overall.percent : 0}
            height={6}
            trackClassName="bg-white/20"
            color={colors.accent[400]}
          />
          <View className="flex-row items-center gap-4 mt-3">
            <View className="flex-row items-center gap-1">
              <BookOpen size={14} color={colors.white} />
              {!showSkeleton ? (
                <Text className="text-white text-sm">
                  {t('courses.lessonsCount', {
                    done: overall.completedLessons,
                    total: overall.totalLessons,
                  })}
                </Text>
              ) : (
                <Skeleton className="h-4 w-24 bg-white/30" />
              )}
            </View>
            <View className="flex-row items-center gap-1">
              <Award size={14} color={colors.accent[300]} />
              {!showSkeleton ? (
                <Text className="text-sm font-semibold text-accent-300">
                  {t('courses.coinsEarned', { coins: overall.coinsEarned })}
                </Text>
              ) : (
                <Skeleton className="h-4 w-28 bg-white/30" />
              )}
            </View>
          </View>
        </LinearGradient>

        {syncStatus === 'error' && (
          <Card className="bg-red-50 border border-red-200">
            <Text className="text-red-900 font-semibold mb-1">
              {t('courses.couldNotRefresh')}
            </Text>
            <Text className="text-sm text-red-800 mb-3">
              {syncError ?? t('common.unknownError')}
            </Text>
            <PressableCard onPress={() => void syncFromCloud()}>
              <Text className="text-red-800 font-semibold">{t('action.retry')}</Text>
            </PressableCard>
          </Card>
        )}

        <View>
          <Text className="text-lg text-gray-800 font-semibold mb-3">
            {t('courses.availableCourses')}
          </Text>
          {!showSkeleton && topics.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
            >
              {topics.map((k) => {
                const active = topic === k;
                const label = k === 'all' ? 'All' : k;
                return (
                  <Button
                    key={k}
                    size="sm"
                    variant={active ? 'primary' : 'outline'}
                    onPress={() => setTopic(k)}
                  >
                    {label}
                  </Button>
                );
              })}
            </ScrollView>
          )}
          <View className="gap-3">
            {showSkeleton ? (
              <>
                {[0, 1, 2].map((i) => (
                  <Card key={i} padded={false}>
                    <View className="flex-row">
                      <Skeleton
                        className="w-[72px] h-[92px] rounded-none"
                        style={{
                          borderTopLeftRadius: 12,
                          borderBottomLeftRadius: 12,
                        }}
                      />
                      <View className="flex-1 p-3 gap-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-2 w-full rounded-full" />
                        <View className="flex-row gap-2 mt-1">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-5 w-24 rounded-full" />
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
              </>
            ) : visibleCourses.length === 0 ? (
              <Card className="items-center py-8">
                <Text className="text-gray-800 font-semibold mb-1">
                  {t('courses.noCoursesYet')}
                </Text>
                <Text className="text-sm text-gray-500 text-center mb-4">
                  {t('courses.trySyncAgain')}
                </Text>
                <PressableCard onPress={() => void syncFromCloud()}>
                  <Text className="text-primary-700 font-semibold">
                    {t('courses.retrySync')}
                  </Text>
                </PressableCard>
              </Card>
            ) : (
              visibleCourses.map((course) => {
                const courseLessons = lessons.filter((l) => l.courseId === course.id);
                const completed = courseLessons.filter((l) =>
                  completedLessons.includes(l.id)
                ).length;
                const percent =
                  courseLessons.length > 0
                    ? Math.round((completed / courseLessons.length) * 100)
                    : 0;

                return (
                  <PressableCard
                    key={course.id}
                    onPress={() => router.push(`/courses/${course.id}` as never)}
                    padded={false}
                  >
                    <View className="flex-row">
                      <View
                        style={{
                          width: 72,
                          backgroundColor: course.color,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 32 }}>{course.icon}</Text>
                      </View>
                      <View className="flex-1 p-3">
                        <View className="flex-row items-start justify-between">
                          <Text className="text-base text-gray-900 font-semibold flex-1 pr-2">
                            {course.title}
                          </Text>
                          <ChevronRight size={18} color={colors.gray[400]} />
                        </View>
                        <Text className="text-xs text-gray-500 mt-0.5">
                          {course.description}
                        </Text>
                        <View className="mt-2">
                          <ProgressBar value={percent} height={4} />
                        </View>
                        <View className="flex-row items-center gap-3 mt-2">
                          <View className="flex-row items-center gap-1">
                            <Clock size={12} color={colors.gray[500]} />
                            <Text className="text-xs text-gray-500">
                              {t('courses.lessonsLabel', {
                                n: courseLessons.length,
                              })}
                            </Text>
                          </View>
                          <Badge variant={percent === 100 ? 'success' : 'default'}>
                            {percent === 100
                              ? t('courses.completed')
                              : percent > 0
                                ? t('courses.inProgress')
                                : t('marketplace.earnCoinsSuffix', {
                                    n: course.coinReward,
                                  })}
                          </Badge>
                        </View>
                      </View>
                    </View>
                  </PressableCard>
                );
              })
            )}
          </View>
        </View>

        <Card className="bg-purple-50 border-purple-100">
          <View className="flex-row items-center gap-3">
            <Text style={{ fontSize: 28 }}>🧠</Text>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold">
                {t('courses.quizEarnCoinsTitle')}
              </Text>
              <Text className="text-sm text-gray-600">
                {t('courses.quizEarnCoinsBody')}
              </Text>
            </View>
          </View>
          <View className="mt-3">
            <Button fullWidth onPress={() => router.push('/quizzes' as never)}>
              {t('dashboard.takeQuiz')}
            </Button>
          </View>
        </Card>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function computeOverallProgress(
  courses: ReturnType<typeof useContentStore.getState>['courses'],
  lessons: ReturnType<typeof useContentStore.getState>['lessons'],
  completed: string[]
) {
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => completed.includes(l.id)).length;
  const percent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const coinsEarned = courses.reduce((sum, course) => {
    const cl = lessons.filter((l) => l.courseId === course.id);
    if (cl.length === 0) return sum;
    const done = cl.every((l) => completed.includes(l.id));
    return done ? sum + course.coinReward : sum;
  }, 0);
  return { totalLessons, completedLessons, percent, coinsEarned };
}

