import { Alert, DevSettings, I18nManager, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  Award,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Cloud,
  CloudOff,
  CreditCard,
  Globe,
  RefreshCw,
  Settings,
  TrendingUp,
} from 'lucide-react-native';
import { router } from 'expo-router';
import type { ComponentType } from 'react';
import { useMemo, useRef, useState } from 'react';

import { BottomNav } from '@/components/BottomNav';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';
import { LOCALES, isRTL } from '@/lib/i18n';
import { isAdminEmail, isAdminUIEnabled } from '@/lib/admin';
import { useT } from '@/hooks/useT';
import {
  useAuthStore,
  useLocaleStore,
  useUserStore,
  xpProgressToNextLevel,
} from '@/stores';

interface Achievement {
  id: number;
  title: string;
  icon: string;
  earned: boolean;
}

const achievements: Achievement[] = [
  { id: 1, title: 'First Course', icon: '🎓', earned: true },
  { id: 2, title: 'Quiz Master', icon: '🏆', earned: true },
  { id: 3, title: 'Trading Pro', icon: '📈', earned: true },
  { id: 4, title: 'Streak King', icon: '🔥', earned: false },
  { id: 5, title: 'Top 10', icon: '⭐', earned: false },
  { id: 6, title: 'Perfect Score', icon: '💯', earned: false },
];

interface SettingItemProps {
  Icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingItem({ Icon, label, value, onPress }: SettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between p-3 rounded-lg active:bg-gray-100"
    >
      <View className="flex-row items-center gap-3">
        <Icon size={20} color={colors.gray[600]} />
        <Text className="text-gray-800 text-base">{label}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {value && <Text className="text-sm text-gray-500">{value}</Text>}
        <ChevronRight size={20} color={colors.gray[400]} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { t } = useT();
  const profile = useUserStore((s) => s.profile);
  const coins = useUserStore((s) => s.coins);
  const xp = useUserStore((s) => s.xp);
  const level = useUserStore((s) => s.level);
  const syncStatus = useUserStore((s) => s.syncStatus);
  const lastSyncedAt = useUserStore((s) => s.lastSyncedAt);
  const pushSnapshot = useUserStore((s) => s.pushSnapshot);
  const remoteUserId = useUserStore((s) => s.remoteUserId);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const authEmail = useAuthStore((s) => s.user?.email ?? null);
  const signOut = useAuthStore((s) => s.signOut);

  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  // Safer UX: admin UI is disabled by default, and requires a secret unlock gesture.
  const adminEnabled = isAdminUIEnabled();
  const isAdmin = isAdminEmail(authEmail);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const adminHoldRef = useRef<{ timer: ReturnType<typeof setTimeout> | null }>({
    timer: null,
  });
  const unlockRef = useRef<{ count: number; lastAt: number }>({
    count: 0,
    lastAt: 0,
  });

  const canShowAdminUI = useMemo(() => {
    return adminEnabled && isAdmin && adminUnlocked;
  }, [adminEnabled, isAdmin, adminUnlocked]);

  const handleLanguagePick = () => {
    Alert.alert(
      t('profile.chooseLanguage'),
      undefined,
      [
        ...LOCALES.map((opt) => ({
          text: opt.nativeLabel,
          onPress: () => {
            if (opt.code === locale) return;
            setLocale(opt.code);
            const targetRTL = isRTL(opt.code);
            if (I18nManager.isRTL !== targetRTL) {
              Alert.alert(
                t('profile.languageChanged'),
                t('profile.restartNeeded'),
                [
                  { text: t('common.later'), style: 'cancel' },
                  {
                    text: t('profile.restartNow'),
                    onPress: () => {
                      try {
                        DevSettings.reload();
                      } catch {
                        // If reload isn't available (rare), user can restart manually.
                      }
                    },
                  },
                ]
              );
            }
          },
        })),
        { text: t('common.cancel'), style: 'cancel' as const },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(t('profile.signOutQ'), t('profile.signOutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const syncLabel = (() => {
    if (!remoteUserId) return t('profile.sync.offlineNoAccount');
    if (syncStatus === 'syncing') return t('profile.sync.syncing');
    if (syncStatus === 'error') return t('profile.sync.failedTapRetry');
    if (syncStatus === 'synced' && lastSyncedAt) {
      const mins = Math.max(1, Math.round((Date.now() - lastSyncedAt) / 60000));
      return t('profile.sync.syncedMinsAgo', { mins });
    }
    return t('profile.sync.ready');
  })();

  const SyncIcon = remoteUserId
    ? syncStatus === 'error'
      ? CloudOff
      : syncStatus === 'syncing'
        ? RefreshCw
        : Check
    : CloudOff;

  const syncColor = remoteUserId
    ? syncStatus === 'error'
      ? '#ef4444'
      : syncStatus === 'synced'
        ? '#22c55e'
        : colors.primary[600]
    : colors.gray[500];

  const completedCourses = 12;
  const totalCourses = 24;
  const quizAverage = 85;
  const simulationWinRate = 78;
  const badgesCount = achievements.filter((a) => a.earned).length;
  const xpInfo = xpProgressToNextLevel(xp);

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title={t('profile.myProfile')}
        showBell={false}
        rightSlot={
          <Pressable
            onPress={() => router.push('/settings' as never)}
            onPressIn={() => {
              // Hold-to-open admin (5s). Only for allowlisted admin emails.
              if (!adminEnabled || !isAdmin) return;
              if (adminHoldRef.current.timer) clearTimeout(adminHoldRef.current.timer);
              adminHoldRef.current.timer = setTimeout(() => {
                setAdminUnlocked(true);
                unlockRef.current.count = 0;
                router.push('/admin' as never);
              }, 5000);
            }}
            onPressOut={() => {
              if (adminHoldRef.current.timer) {
                clearTimeout(adminHoldRef.current.timer);
                adminHoldRef.current.timer = null;
              }
            }}
            onLongPress={() => {
              if (!adminEnabled || !isAdmin) return;
              const now = Date.now();
              const withinWindow = now - unlockRef.current.lastAt < 2500;
              unlockRef.current.count = withinWindow
                ? unlockRef.current.count + 1
                : 1;
              unlockRef.current.lastAt = now;
              if (unlockRef.current.count >= 7) {
                setAdminUnlocked(true);
                unlockRef.current.count = 0;
              }
            }}
            hitSlop={8}
            className="p-1 -m-1"
          >
            <Settings size={22} color={colors.white} />
          </Pressable>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="border-2 border-primary-100">
          <View className="flex-row items-center gap-4 mb-4">
            <LinearGradient
              colors={[colors.primary[500], '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {profile.avatarImageUri ? (
                <Image
                  source={{ uri: profile.avatarImageUri }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                  contentFit="cover"
                />
              ) : (
                <Text className="text-4xl">{profile.avatar || '👤'}</Text>
              )}
            </LinearGradient>

            <View className="flex-1">
              <Text className="text-xl text-gray-800 font-bold">
                {profile.name}
              </Text>
              <Text className="text-sm text-gray-600 mb-2">
                {profile.email}
              </Text>
              <Badge
                variant="accent"
                leftIcon={<TrendingUp size={12} color={colors.accent[800]} />}
              >
                {t('profile.levelBadge', { level, rank: profile.level })}
              </Badge>
            </View>
          </View>

          <View className="flex-row gap-3 pt-4 border-t border-gray-100">
            <View className="flex-1 items-center">
              <Text className="text-2xl text-primary-600 font-bold mb-1">
                {formatNumber(coins)}
              </Text>
              <Text className="text-xs text-gray-600">{t('profile.coins')}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl text-green-600 font-bold mb-1">
                {completedCourses}
              </Text>
              <Text className="text-xs text-gray-600">
                {t('profile.completed')}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl text-purple-600 font-bold mb-1">
                {badgesCount}
              </Text>
              <Text className="text-xs text-gray-600">
                {t('profile.badges')}
              </Text>
            </View>
          </View>

          <View className="mt-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-gray-600">
                {t('profile.xpToLevel', { n: level + 1 })}
              </Text>
              <Text className="text-xs text-gray-600 font-medium">
                {t('profile.xpProgress', {
                  current: xpInfo.current,
                  target: xpInfo.target,
                })}
              </Text>
            </View>
            <ProgressBar
              value={xpInfo.pct}
              height={6}
              gradient={[colors.accent[400], colors.accent[500]]}
            />
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-2 mb-4">
            <BookOpen size={20} color={colors.primary[600]} />
            <Text className="text-lg text-gray-800 font-semibold">
              {t('profile.learningProgressTitle')}
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-700">Course Completion</Text>
                <Text className="text-sm text-gray-600">
                  {t('profile.coursesOfCourses', {
                    done: completedCourses,
                    total: totalCourses,
                  })}
                </Text>
              </View>
              <ProgressBar
                value={(completedCourses / totalCourses) * 100}
                height={6}
              />
            </View>

            <View>
              <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-700">
                    {t('profile.quizPerformance')}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {t('profile.quizAverage', { n: quizAverage })}
                  </Text>
              </View>
              <ProgressBar value={quizAverage} height={6} color="#22c55e" />
            </View>

            <View>
              <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-700">
                    {t('profile.simulationSuccess')}
                  </Text>
                <Text className="text-sm text-gray-600">
                    {t('profile.simWinRate', { n: simulationWinRate })}
                </Text>
              </View>
              <ProgressBar
                value={simulationWinRate}
                height={6}
                color="#a855f7"
              />
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-2 mb-4">
            <Award size={20} color={colors.accent[500]} />
            <Text className="text-lg text-gray-800 font-semibold">
              {t('profile.achievementsTitle')}
            </Text>
          </View>

          <View className="flex-row flex-wrap -m-1.5">
            {achievements.map((achievement) => (
              <View key={achievement.id} className="w-1/3 p-1.5">
                {achievement.earned ? (
                  <LinearGradient
                    colors={[colors.accent[400], colors.accent[500]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Text className="text-3xl mb-1">{achievement.icon}</Text>
                    <Text className="text-xs text-primary-900 text-center font-medium">
                      {achievement.title}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View className="p-3 rounded-xl bg-gray-100 items-center opacity-50">
                    <Text className="text-3xl mb-1">{achievement.icon}</Text>
                    <Text className="text-xs text-gray-700 text-center">
                      {achievement.title}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View className="mt-4">
            <Button
              variant="outline"
              fullWidth
              onPress={() => router.push('/badges' as never)}
            >
              {t('profile.viewAllBadges')}
            </Button>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-2 mb-3">
            <Cloud size={20} color={colors.primary[600]} />
            <Text className="text-lg text-gray-800 font-semibold">
              {t('profile.cloudSync')}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              if (!remoteUserId) return;
              pushSnapshot();
            }}
            className="flex-row items-center justify-between p-3 rounded-lg active:bg-gray-100"
          >
            <View className="flex-row items-center gap-3">
              <SyncIcon size={20} color={syncColor} />
              <View>
                <Text className="text-gray-800 text-base">{syncLabel}</Text>
                {remoteUserId ? (
                  <Text className="text-xs text-gray-500 mt-0.5">
                    {t('profile.tapToSyncNow')}
                  </Text>
                ) : (
                  <Text className="text-xs text-gray-500 mt-0.5">
                    {t('profile.signInToBackup')}
                  </Text>
                )}
              </View>
            </View>
            {remoteUserId && <RefreshCw size={18} color={colors.gray[400]} />}
          </Pressable>
        </Card>

        <Card>
          <Text className="text-lg text-gray-800 font-semibold mb-4">
            {t('profile.settingsPrefs')}
          </Text>

          <View className="gap-1">
            <SettingItem
              Icon={Bell}
              label={t('profile.notifications')}
              onPress={() =>
                router.push('/settings' as never)
              }
            />
            <SettingItem
              Icon={Globe}
              label={t('profile.language')}
              value={currentLocale.nativeLabel}
              onPress={handleLanguagePick}
            />
            <SettingItem
              Icon={CreditCard}
              label={t('profile.paymentSettings')}
              onPress={() =>
                router.push(
                  `/coming-soon?title=${encodeURIComponent(
                    'Payment settings'
                  )}&description=${encodeURIComponent(
                    'Payment settings are coming soon.'
                  )}` as never
                )
              }
            />
            <SettingItem
              Icon={Award}
              label={t('profile.rewardRedemption')}
              onPress={() =>
                router.push(
                  `/coming-soon?title=${encodeURIComponent(
                    'Reward redemption'
                  )}&description=${encodeURIComponent(
                    'A redemption history screen is coming soon.'
                  )}` as never
                )
              }
            />
            {canShowAdminUI && (
              <SettingItem
                Icon={Settings}
                label={t('profile.adminDashboard')}
                value={t('profile.restricted')}
                onPress={() => router.push('/admin')}
              />
            )}
          </View>
        </Card>

        <View className="gap-2">
          <Button
            variant="outline"
            fullWidth
            onPress={() =>
              router.push('/edit-profile' as never)
            }
          >
            {t('profile.editProfile')}
          </Button>
          <Button variant="ghost" fullWidth onPress={handleSignOut}>
            <Text className="text-red-600 font-semibold">
              {t('profile.signOut')}
            </Text>
          </Button>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
