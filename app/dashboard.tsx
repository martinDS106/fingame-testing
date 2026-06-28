import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  DollarSign,
  Play,
  Trophy,
} from 'lucide-react-native';
import { router } from 'expo-router';

import { useDailyCheckIn } from '@/hooks/useDailyCheckIn';
import { useT } from '@/hooks/useT';

import { FadeInView } from '@/components/animated';
import { BottomNav } from '@/components/BottomNav';
import { CoinsCounter } from '@/components/CoinsCounter';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StreakWidget } from '@/components/StreakWidget';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import {
  rtlRootDirection,
  rtlTextStyle,
  rtlRow,
  mergeScrollContentRtl,
  localeBannerAlignStyle,
  localeIconRowStyle,
  localeTextBesideIconStyle,
  localeTrailingGroupRowStyle,
} from '@/lib/rtlStyle';
import { useContentStore, useUserStore } from '@/stores';
import { pullLeaderboardTop, type RemoteLeaderboardEntry } from '@/lib/syncServiceApi';
import { showAppNotify } from '@/lib/appNotify';

export default function DashboardScreen() {
  const coins = useUserStore((s) => s.coins);
  const streak = useUserStore((s) => s.streak);
  const profile = useUserStore((s) => s.profile);
  const contentCourses = useContentStore((s) => s.courses);
  const lessonsFor = useContentStore((s) => s.lessonsFor);
  const completedLessons = useContentStore((s) => s.completedLessons);
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);

  const featuredCourses = useMemo(() => {
    return [...contentCourses].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 3);
  }, [contentCourses]);

  const courseProgressPct = useCallback(
    (courseId: string): number => {
      const lessons = lessonsFor(courseId);
      if (!lessons.length) return 0;
      const done = lessons.filter((l) => completedLessons.includes(l.id)).length;
      return Math.round((done / lessons.length) * 100);
    },
    [completedLessons, lessonsFor]
  );

  const [leaderboardRows, setLeaderboardRows] = useState<RemoteLeaderboardEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    void pullLeaderboardTop(3).then((data) => {
      if (!cancelled) setLeaderboardRows(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleReward = useCallback(
    (r: { awarded: boolean; coins: number; newStreak: number }) => {
      if (r.awarded) {
        showAppNotify({
          variant: 'reward',
          title: t('dashboard.rewardTitle'),
          message: t('dashboard.rewardSnack', { coins: r.coins, streak: r.newStreak }),
        });
      }
    },
    [t]
  );
  useDailyCheckIn(handleReward);

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('dashboard.hi', { name: profile.name.split(' ')[0] })}
        showMenu
        rightSlot={<CoinsCounter coins={coins} />}
        showBell
        notificationCount={3}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 16 })}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView direction="down" duration={450}>
          <LinearGradient
            colors={[colors.accent[400], colors.accent[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View style={localeBannerAlignStyle(rtl)}>
              <Text style={ta} className="text-2xl text-primary-900 font-bold mb-1">
                {t('dashboard.welcomeBack')}
              </Text>
              <Text style={ta} className="text-primary-800">
                {t('dashboard.readyToLearn')}
              </Text>
            </View>
          </LinearGradient>
        </FadeInView>

        <FadeInView delay={80} duration={450}>
          <StreakWidget days={streak} />
        </FadeInView>

        <Pressable
          onPress={() => router.push('/marketplace-home' as never)}
          className="active:opacity-90"
        >
          <LinearGradient
            colors={['#a855f7', colors.primary[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="mb-4" style={localeTrailingGroupRowStyle(rtl)}>
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <DollarSign size={24} color={colors.white} />
              </View>
              <View style={localeTextBesideIconStyle(rtl)}>
                <Text
                  style={[ta, { alignSelf: 'stretch' }]}
                  className="text-lg text-white font-semibold mb-1"
                >
                  {t('dashboard.financialMarketplace')}
                </Text>
                <Text
                  style={[ta, { alignSelf: 'stretch' }]}
                  className="text-sm text-white/80"
                >
                  {t('dashboard.marketplaceSubtitle')}
                </Text>
              </View>
            </View>
            <Button
              variant="secondary"
              fullWidth
              onPress={() => router.push('/marketplace-home' as never)}
            >
              <Text style={ta} className="text-purple-600 font-semibold">
                {t('dashboard.exploreProducts')}
              </Text>
            </Button>
          </LinearGradient>
        </Pressable>

        <View>
          <View
            className="mb-3"
            style={[
              { alignItems: 'center', justifyContent: 'space-between' },
              rtlRow(rtl),
            ]}
          >
            <Text style={ta} className="text-xl text-gray-800 font-semibold">
              {t('dashboard.featuredCourses')}
            </Text>
            <Pressable
              onPress={() => router.push('/courses' as never)}
              className="active:opacity-60"
            >
              <Text style={ta} className="text-primary-600 font-medium">
                {t('action.seeAll')}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={rtlRootDirection(rtl)}
            contentContainerStyle={mergeScrollContentRtl(rtl, {
              gap: 12,
              paddingHorizontal: 8,
              ...rtlRow(rtl),
            })}
          >
            {(featuredCourses.length ? featuredCourses : contentCourses.slice(0, 3)).map(
              (course) => {
              const percent = courseProgressPct(course.id);
              return (
                <PressableCard
                  key={course.id}
                  onPress={() => router.push(`/courses/${course.id}` as never)}
                  className="w-64 border-2 border-transparent"
                >
                  <View style={[localeIconRowStyle(rtl), { gap: 12, alignItems: 'flex-start' }]}>
                    {rtl ? (
                      <>
                        <View style={localeTextBesideIconStyle(rtl)}>
                          <Text
                            style={[ta, { alignSelf: 'stretch' }]}
                            className="text-base text-gray-900 font-semibold mb-1"
                            numberOfLines={1}
                          >
                            {course.title}
                          </Text>
                          <Text
                            style={[ta, { alignSelf: 'stretch' }]}
                            className="text-sm text-gray-600 mb-3"
                            numberOfLines={2}
                          >
                            {course.description}
                          </Text>
                          <View className="mb-3">
                            <View
                              className="mb-1"
                              style={[
                                {
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                },
                                rtlRow(rtl),
                              ]}
                            >
                              <Text style={ta} className="text-xs text-gray-600">
                                {t('dashboard.progress')}
                              </Text>
                              <Text style={ta} className="text-xs text-gray-600 font-medium">
                                {percent}%
                              </Text>
                            </View>
                            <ProgressBar value={percent} height={6} />
                          </View>
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onPress={() => router.push(`/courses/${course.id}` as never)}
                          >
                            {t('dashboard.continue')}
                          </Button>
                        </View>
                        <View
                          className="w-12 h-12 rounded-xl items-center justify-center shrink-0"
                          style={{ backgroundColor: course.color }}
                        >
                          <Text style={ta} className="text-2xl">
                            {course.icon}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View
                          className="w-12 h-12 rounded-xl items-center justify-center shrink-0"
                          style={{ backgroundColor: course.color }}
                        >
                          <Text style={ta} className="text-2xl">
                            {course.icon}
                          </Text>
                        </View>
                        <View style={localeTextBesideIconStyle(rtl)}>
                      <Text
                        style={[ta, { alignSelf: 'stretch' }]}
                        className="text-base text-gray-900 font-semibold mb-1"
                        numberOfLines={1}
                      >
                        {course.title}
                      </Text>
                      <Text
                        style={[ta, { alignSelf: 'stretch' }]}
                        className="text-sm text-gray-600 mb-3"
                        numberOfLines={2}
                      >
                        {course.description}
                      </Text>
                      <View className="mb-3">
                        <View
                          className="mb-1"
                          style={[
                            {
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            },
                            rtlRow(rtl),
                          ]}
                        >
                          <Text style={ta} className="text-xs text-gray-600">
                            {t('dashboard.progress')}
                          </Text>
                          <Text style={ta} className="text-xs text-gray-600 font-medium">
                            {percent}%
                          </Text>
                        </View>
                        <ProgressBar value={percent} height={6} />
                      </View>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onPress={() => router.push(`/courses/${course.id}` as never)}
                      >
                        {t('dashboard.continue')}
                      </Button>
                        </View>
                      </>
                    )}
                  </View>
                </PressableCard>
              );
            })}
          </ScrollView>
        </View>

        <View className="gap-3" style={[{ alignItems: 'stretch' }, rtlRow(rtl)]}>
          <PressableCard
            onPress={() => router.push('/quizzes' as never)}
            className="flex-1 border-0 p-0 overflow-hidden"
            padded={false}
          >
            <LinearGradient
              colors={['#a855f7', '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16, borderRadius: 16 }}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Award size={24} color={colors.white} />
              </View>
              <Text style={ta} className="text-white font-semibold mb-1">
                {t('dashboard.dailyQuiz')}
              </Text>
              <Text style={ta} className="text-sm text-purple-100 mb-3">
                {t('dashboard.testKnowledge')}
              </Text>
              <View className="bg-white rounded-lg py-2 items-center">
                <Text style={ta} className="text-purple-600 font-semibold text-sm">
                  {t('dashboard.takeQuiz')}
                </Text>
              </View>
            </LinearGradient>
          </PressableCard>

          <PressableCard
            onPress={() => router.push('/simulation-hub' as never)}
            className="flex-1 border-0 p-0 overflow-hidden"
            padded={false}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16, borderRadius: 16 }}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Play size={24} color={colors.white} />
              </View>
              <Text style={ta} className="text-white font-semibold mb-1">
                {t('dashboard.simulation')}
              </Text>
              <Text style={ta} className="text-sm text-green-100 mb-3">
                {t('dashboard.practiceTrading')}
              </Text>
              <View className="bg-white rounded-lg py-2 items-center">
                <Text style={ta} className="text-green-600 font-semibold text-sm">
                  {t('dashboard.startNow')}
                </Text>
              </View>
            </LinearGradient>
          </PressableCard>
        </View>

        <View>
          <View
            className="mb-3"
            style={[
              { alignItems: 'center', justifyContent: 'space-between' },
              rtlRow(rtl),
            ]}
          >
            <View
              className="gap-2"
              style={[{ alignItems: 'center' }, rtlRow(rtl)]}
            >
              <Trophy size={20} color={colors.accent[500]} />
              <Text style={ta} className="text-xl text-gray-800 font-semibold">
                {t('dashboard.leaderboard')}
              </Text>
            </View>
            <Pressable
              className="active:opacity-60"
              onPress={() => router.push('/leaderboard' as never)}
            >
              <Text style={ta} className="text-primary-600 font-medium">
                {t('action.viewAll')}
              </Text>
            </Pressable>
          </View>

          <Card>
            <View className="gap-2">
              {leaderboardRows.map((user, idx) => (
                <LeaderboardRow
                  key={user.user_id}
                  rtl={rtl}
                  rank={idx + 1}
                  displayName={user.display_name}
                  avatar={user.avatar}
                  coins={user.coins}
                  xp={user.xp}
                  streak={user.streak}
                  pointsLabel={t('dashboard.points', {
                    points: (user.coins ?? 0).toLocaleString(),
                  })}
                  showXpStreak
                />
              ))}
              {leaderboardRows.length === 0 && (
                <Text style={ta} className="text-sm text-gray-600">
                  No leaderboard data yet.
                </Text>
              )}
            </View>

            <View className="mt-4">
              <Button
                variant="accent"
                fullWidth
                onPress={() =>
                  router.push(
                    `/coming-soon?title=${encodeURIComponent(
                      'Leaderboard'
                    )}&description=${encodeURIComponent(
                      'Leaderboard competition is coming soon.'
                    )}` as never
                  )
                }
              >
                {t('dashboard.joinCompetition')}
              </Button>
            </View>
          </Card>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
