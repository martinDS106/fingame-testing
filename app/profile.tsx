import { Alert, DevSettings, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  Award,
  Bell,
  BookOpen,
  Check,
  Cloud,
  CloudOff,
  CreditCard,
  Globe,
  History,
  RefreshCw,
  Settings,
  TrendingUp,
} from 'lucide-react-native';
import { router } from 'expo-router';
import type { ComponentType } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BottomNav } from '@/components/BottomNav';
import { LocaleChevron } from '@/components/LocaleChevron';
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
import { useProfileGamification } from '@/hooks/useProfileGamification';
import {
  listRowLeadingStyle,
  listRowStyle,
  listRowTrailingStyle,
  mergeScrollContentRtl,
  rtlRootDirection,
  rtlRow,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import {
  useAuthStore,
  useLocaleStore,
  useUserStore,
  xpProgressToNextLevel,
} from '@/stores';

interface SettingItemProps {
  rtl: boolean;
  Icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingItem({ rtl, Icon, label, value, onPress }: SettingItemProps) {
  const ta = rtlTextStyle(rtl);
  return (
    <Pressable
      onPress={onPress}
      style={[listRowStyle(), { borderRadius: 8 }]}
      className="active:bg-gray-100"
    >
      <View style={listRowLeadingStyle()}>
        <Icon size={20} color={colors.gray[600]} />
        <Text
          style={[ta, { flex: 1, fontSize: 16, color: colors.gray[800] }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <View style={listRowTrailingStyle()}>
        {value ? (
          <Text
            style={[ta, { fontSize: 14, color: colors.gray[500], maxWidth: 120 }]}
            numberOfLines={1}
          >
            {value}
          </Text>
        ) : null}
        <LocaleChevron rtl={rtl} color={colors.gray[500]} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
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

  const profileStats = useProfileGamification();

  useEffect(() => {
    const email = authEmail?.trim();
    if (!email) return;
    if (profile.email === email) return;
    useUserStore.getState().updateProfile({ email });
  }, [authEmail, profile.email]);

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
            const wasRtl = isRTL(locale);
            setLocale(opt.code);
            const nowRtl = isRTL(opt.code);
            if (wasRtl !== nowRtl) {
              setTimeout(() => {
                try {
                  DevSettings.reload();
                } catch {
                  /* web or unsupported */
                }
              }, 100);
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

  const xpInfo = xpProgressToNextLevel(xp);

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('profile.myProfile')}
        showBack
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
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 16 })}
        showsVerticalScrollIndicator={false}
      >
        <Card className="border-2 border-primary-100">
          <View className="items-center gap-4 mb-4" style={rtlRow(rtl)}>
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
                <Text className="text-4xl" style={ta}>
                  {profile.avatar || '👤'}
                </Text>
              )}
            </LinearGradient>

            <View className="flex-1">
              <Text style={ta} className="text-xl text-gray-800 font-bold">
                {profile.name}
              </Text>
              <Text style={ta} className="text-sm text-gray-600 mb-2">
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

          <View className="gap-3 pt-4 border-t border-gray-100" style={rtlRow(rtl)}>
            <View className="flex-1 items-center">
              <Text style={ta} className="text-2xl text-primary-600 font-bold mb-1">
                {formatNumber(coins)}
              </Text>
              <Text style={ta} className="text-xs text-gray-600">
                {t('profile.coins')}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text style={ta} className="text-2xl text-green-600 font-bold mb-1">
                {profileStats.completedCourses}
              </Text>
              <Text style={ta} className="text-xs text-gray-600">
                {t('profile.completed')}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text style={ta} className="text-2xl text-purple-600 font-bold mb-1">
                {profileStats.badgesCount}
              </Text>
              <Text style={ta} className="text-xs text-gray-600">
                {t('profile.badges')}
              </Text>
            </View>
          </View>

          <View className="mt-4">
            <View className="justify-between mb-2 items-center" style={rtlRow(rtl)}>
              <Text style={ta} className="text-xs text-gray-600">
                {t('profile.xpToLevel', { n: level + 1 })}
              </Text>
              <Text style={ta} className="text-xs text-gray-600 font-medium">
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
          <View className="items-center gap-2 mb-4" style={rtlRow(rtl)}>
            <BookOpen size={20} color={colors.primary[600]} />
            <Text style={ta} className="text-lg text-gray-800 font-semibold">
              {t('profile.learningProgressTitle')}
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <View className="justify-between mb-2 items-center" style={rtlRow(rtl)}>
                <Text style={ta} className="text-sm text-gray-700">
                  {t('profile.courseCompletion')}
                </Text>
                <Text style={ta} className="text-sm text-gray-600">
                  {t('profile.lessonsOfLessons', {
                    done: profileStats.lessonProgress.completedLessons,
                    total: profileStats.lessonProgress.totalLessons,
                  })}
                </Text>
              </View>
              <ProgressBar
                value={profileStats.lessonProgress.percent}
                height={6}
              />
            </View>

            <View>
              <View className="justify-between mb-2 items-center" style={rtlRow(rtl)}>
                <Text style={ta} className="text-sm text-gray-700">
                  {t('profile.quizPerformance')}
                </Text>
                <Text style={ta} className="text-sm text-gray-600">
                  {t('profile.quizAverage', { n: profileStats.quizAverage })}
                </Text>
              </View>
              <ProgressBar value={profileStats.quizAverage} height={6} color="#22c55e" />
            </View>

            <View>
              <View className="justify-between mb-2 items-center" style={rtlRow(rtl)}>
                <Text style={ta} className="text-sm text-gray-700">
                  {t('profile.simulationSuccess')}
                </Text>
                <Text style={ta} className="text-sm text-gray-600">
                  {t('profile.simWinRate', { n: profileStats.simulationWinRate })}
                </Text>
              </View>
              <ProgressBar
                value={profileStats.simulationWinRate}
                height={6}
                color="#a855f7"
              />
            </View>
          </View>
        </Card>

        <Card>
          <View className="items-center gap-2 mb-4" style={rtlRow(rtl)}>
            <Award size={20} color={colors.accent[500]} />
            <Text style={ta} className="text-lg text-gray-800 font-semibold">
              {t('profile.achievementsTitle')}
            </Text>
          </View>

          <View className="flex-wrap -m-1.5" style={rtlRow(rtl)}>
            {profileStats.achievements.map((achievement) => (
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
                    <Text
                      className="text-xs text-primary-900 text-center font-medium"
                      style={{
                        textAlign: 'center',
                        writingDirection: rtl ? 'rtl' : 'ltr',
                      }}
                    >
                      {achievement.title}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View className="p-3 rounded-xl bg-gray-100 items-center opacity-50">
                    <Text className="text-3xl mb-1">{achievement.icon}</Text>
                    <Text
                      className="text-xs text-gray-700 text-center"
                      style={{
                        textAlign: 'center',
                        writingDirection: rtl ? 'rtl' : 'ltr',
                      }}
                    >
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
          <View className="items-center gap-2 mb-3" style={rtlRow(rtl)}>
            <Cloud size={20} color={colors.primary[600]} />
            <Text style={ta} className="text-lg text-gray-800 font-semibold">
              {t('profile.cloudSync')}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              if (!remoteUserId) return;
              pushSnapshot();
            }}
            className="items-center justify-between p-3 rounded-lg active:bg-gray-100"
            style={rtlRow(rtl)}
          >
            <View className="items-center gap-3" style={rtlRow(rtl)}>
              <SyncIcon size={20} color={syncColor} />
              <View>
                <Text style={ta} className="text-gray-800 text-base">
                  {syncLabel}
                </Text>
                {remoteUserId ? (
                  <Text style={ta} className="text-xs text-gray-500 mt-0.5">
                    {t('profile.tapToSyncNow')}
                  </Text>
                ) : (
                  <Text style={ta} className="text-xs text-gray-500 mt-0.5">
                    {t('profile.signInToBackup')}
                  </Text>
                )}
              </View>
            </View>
            {remoteUserId && <RefreshCw size={18} color={colors.gray[400]} />}
          </Pressable>
        </Card>

        <Card>
          <Text style={ta} className="text-lg text-gray-800 font-semibold mb-4">
            {t('profile.settingsPrefs')}
          </Text>

          <View className="gap-1">
            <SettingItem
              rtl={rtl}
              Icon={Bell}
              label={t('profile.notifications')}
              onPress={() =>
                router.push('/settings' as never)
              }
            />
            <SettingItem
              rtl={rtl}
              Icon={Globe}
              label={t('profile.language')}
              value={currentLocale.nativeLabel}
              onPress={handleLanguagePick}
            />
            <SettingItem
              rtl={rtl}
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
              rtl={rtl}
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
            <SettingItem
              rtl={rtl}
              Icon={History}
              label={t('profile.quizHistory')}
              onPress={() => router.push('/quiz-history' as never)}
            />
            {canShowAdminUI && (
              <SettingItem
                rtl={rtl}
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
            <Text style={ta} className="text-red-600 font-semibold">
              {t('profile.signOut')}
            </Text>
          </Button>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
