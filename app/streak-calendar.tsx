import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Coffee, Flame, Star } from 'lucide-react-native';
import type { ComponentType } from 'react';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { useUserStore } from '@/stores';

interface ProtectionOption {
  labelKey: string;
  cost: number;
  Icon: ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const protections: ProtectionOption[] = [
  { labelKey: 'streak.freeze', cost: 50, Icon: Clock, color: colors.primary[600] },
  { labelKey: 'streak.vacation', cost: 100, Icon: Coffee, color: '#9333ea' },
  { labelKey: 'streak.repair', cost: 150, Icon: Star, color: colors.accent[600] },
];

export default function StreakCalendarScreen() {
  const currentStreak = useUserStore((s) => s.streak);
  const longestStreak = useUserStore((s) => s.longestStreak);
  const { t, rtl, locale } = useT();
  const ta = rtlTextStyle(rtl);

  const monthLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [locale]);

  const weekDays = useMemo(() => {
    const base = locale === 'ar' ? 'ar-EG' : 'en-US';
    const formatter = new Intl.DateTimeFormat(base, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(2024, 0, i + 7))
    );
  }, [locale]);

  const milestones = useMemo(
    () => [
      { days: 7, rewardKey: 'streak.milestoneReward7' },
      { days: 30, rewardKey: 'streak.milestoneReward30' },
      { days: 100, rewardKey: 'streak.milestoneReward100' },
    ].map((m) => ({
      ...m,
      reached: currentStreak >= m.days,
      remaining: Math.max(0, m.days - currentStreak),
    })),
    [currentStreak]
  );

  const days = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        completed: i < currentStreak,
        isMilestone: [7, 14, 21, 30].includes(i + 1),
      })),
    [currentStreak]
  );

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('streak.calendarTitle')}
        showBack
        showBell={false}
        gradient={['#ea580c', '#dc2626']}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 32, gap: 16 })}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#f97316', '#dc2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 20 }}
        >
          <View
            style={rtlRowMerge(rtl, {
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginBottom: 24,
            })}
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Flame size={44} color={colors.white} fill={colors.white} />
            </View>
            <View>
              <Text className="text-sm text-orange-100" style={ta}>
                {t('streak.current')}
              </Text>
              <Text className="text-5xl text-white font-bold" style={ta}>
                {currentStreak}
              </Text>
              <Text className="text-sm text-orange-100" style={ta}>
                {t('streak.days', { n: currentStreak })}
              </Text>
            </View>
          </View>

          <View style={rtlRowMerge(rtl, { gap: 16 })}>
            <View
              className="flex-1 rounded-lg p-3 items-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-sm text-orange-100" style={ta}>
                {t('streak.longest')}
              </Text>
              <Text className="text-2xl text-white font-bold" style={ta}>
                {longestStreak}
              </Text>
            </View>
            <View
              className="flex-1 rounded-lg p-3 items-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-sm text-orange-100" style={ta}>
                {t('streak.activeDays')}
              </Text>
              <Text className="text-2xl text-white font-bold" style={ta}>
                {currentStreak}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Card>
          <Text className="text-lg text-gray-800 font-semibold mb-4" style={ta}>
            {monthLabel}
          </Text>
          <View style={rtlRowMerge(rtl, { flexWrap: 'wrap' })} className="-m-1">
            {weekDays.map((wd) => (
              <View
                key={wd}
                style={{ width: '14.2857%' }}
                className="items-center p-1"
              >
                <Text className="text-xs text-gray-600 py-2" style={ta}>
                  {wd}
                </Text>
              </View>
            ))}
            {days.map((d) => (
              <View key={d.day} style={{ width: '14.2857%' }} className="p-1">
                <View
                  style={{ aspectRatio: 1 }}
                  className={`rounded-lg items-center justify-center ${
                    d.completed ? '' : 'bg-gray-100'
                  }`}
                >
                  {d.completed ? (
                    <LinearGradient
                      colors={['#fb923c', '#ea580c']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text className="text-sm text-white font-semibold" style={ta}>
                        {d.day}
                      </Text>
                      {d.isMilestone && (
                        <View
                          style={{
                            position: 'absolute',
                            top: -4,
                            ...(rtl ? { left: -4 } : { right: -4 }),
                          }}
                        >
                          <Star
                            size={12}
                            color={colors.accent[300]}
                            fill={colors.accent[300]}
                          />
                        </View>
                      )}
                    </LinearGradient>
                  ) : (
                    <Text className="text-sm text-gray-400" style={ta}>
                      {d.day}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-gray-800 font-semibold mb-3" style={ta}>
            {t('streak.upcomingMilestones')}
          </Text>
          <View className="gap-2">
            {milestones.map((m) => (
              <View
                key={m.days}
                style={rtlRowMerge(rtl, {
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderRadius: 8,
                })}
                className={m.reached ? 'bg-green-50' : 'bg-gray-50'}
              >
                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12 })}>
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      m.reached ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <Flame size={18} color={colors.white} fill={colors.white} />
                  </View>
                  <View>
                    <Text className="text-sm text-gray-800 font-medium" style={ta}>
                      {t('streak.milestoneDays', { n: m.days })}
                    </Text>
                    <Text className="text-xs text-gray-600" style={ta}>
                      {t(m.rewardKey)}
                    </Text>
                  </View>
                </View>
                <Badge variant={m.reached ? 'success' : 'neutral'}>
                  {m.reached
                    ? t('streak.reached')
                    : t('streak.toGo', { n: m.remaining })}
                </Badge>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-gray-800 font-semibold mb-3" style={ta}>
            {t('streak.protection')}
          </Text>
          <View style={rtlRowMerge(rtl, { gap: 8 })}>
            {protections.map(({ labelKey, cost, Icon, color }) => (
              <Pressable
                key={labelKey}
                className="flex-1 items-center p-3 rounded-xl border border-gray-200 active:bg-gray-50"
              >
                <Icon size={22} color={color} />
                <Text className="text-xs text-gray-800 font-medium mt-1" style={ta}>
                  {t(labelKey)}
                </Text>
                <Text className="text-xs text-gray-500" style={ta}>
                  {t('streak.coinsCost', { n: cost })}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card className="bg-primary-50 border-primary-100">
          <Text className="text-gray-800 font-semibold mb-2" style={ta}>
            {t('streak.tipsTitle')}
          </Text>
          <View className="gap-1">
            <Text className="text-sm text-gray-600" style={ta}>
              • {t('streak.tip1')}
            </Text>
            <Text className="text-sm text-gray-600" style={ta}>
              • {t('streak.tip2')}
            </Text>
            <Text className="text-sm text-gray-600" style={ta}>
              • {t('streak.tip3')}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
