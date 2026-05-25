import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { AlertTriangle, CheckCircle2, Flame, Star } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useLocalizedChallenges } from '@/hooks/useLocalizedChallenges';
import { useT } from '@/hooks/useT';
import { useChallengesStore, useUserStore } from '@/stores';

function difficultyColor(d: 'easy' | 'medium' | 'hard'): string {
  if (d === 'easy') return '#16a34a';
  if (d === 'medium') return '#f59e0b';
  return '#dc2626';
}

export default function ChallengesListScreen() {
  const coins = useUserStore((s) => s.coins);
  const challenges = useLocalizedChallenges();
  const completed = useChallengesStore((s) => s.completed);
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);

  const done = completed.length;
  const pct = challenges.length ? (done / challenges.length) * 100 : 0;

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('challenges.title')}
        showBack
        showBell={false}
        gradient={[colors.primary[600], colors.primary[700]]}
        rightSlot={
          <View
            className="items-center gap-1.5 bg-accent-400 px-3 py-1 rounded-full"
            style={rtlRowMerge(rtl, { alignItems: 'center', gap: 6 })}
          >
            <Star
              size={14}
              color={colors.primary[900]}
              fill={colors.primary[900]}
            />
            <Text className="text-primary-900 text-sm font-semibold" style={ta}>
              {formatNumber(coins)}
            </Text>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 40, gap: 16 })}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary[600], colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16, padding: 16 }}
        >
          <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 })}>
            <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
              <Flame size={18} color={colors.accent[300]} />
              <Text className="text-white font-semibold" style={ta}>
                {t('challenges.scenarioMode')}
              </Text>
            </View>
            <Text className="text-white/80 text-sm" style={ta}>
              {t('challenges.completeCount', {
                done,
                total: challenges.length,
              })}
            </Text>
          </View>
          <ProgressBar
            value={pct}
            height={6}
            trackClassName="bg-white/20"
            color={colors.accent[400]}
          />
          <Text className="text-white/80 text-xs mt-2" style={ta}>
            {t('challenges.pickBest')}
          </Text>
        </LinearGradient>

        <Card className="bg-primary-50 border-primary-100">
          <Text className="text-gray-800 font-semibold mb-2" style={ta}>
            🧠 {t('challenges.howItWorks')}
          </Text>
          <Text className="text-sm text-gray-600" style={ta}>
            {t('challenges.howItWorksBody')}
          </Text>
        </Card>

        <View className="gap-3">
          {challenges.map((c) => {
            const isDone = completed.includes(c.id);
            return (
              <PressableCard
                key={c.id}
                onPress={() => router.push(`/challenges/${c.id}` as never)}
              >
                <View style={rtlRowMerge(rtl, { alignItems: 'flex-start', gap: 12 })}>
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: `${difficultyColor(c.difficulty)}22`,
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={22} color="#16a34a" />
                    ) : (
                      <AlertTriangle
                        size={22}
                        color={difficultyColor(c.difficulty)}
                      />
                    )}
                  </View>

                  <View className="flex-1">
                    <View
                      style={rtlRowMerge(rtl, {
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 8,
                        marginBottom: 4,
                      })}
                    >
                      <Text className="text-gray-900 font-semibold flex-1" style={ta}>
                        {c.title}
                      </Text>
                      <Badge
                        variant={
                          c.difficulty === 'easy'
                            ? 'success'
                            : c.difficulty === 'medium'
                              ? 'warning'
                              : 'danger'
                        }
                      >
                        {t(`challenges.difficulty.${c.difficulty}`)}
                      </Badge>
                    </View>
                    <Text className="text-sm text-gray-600 mb-2" style={ta}>
                      {c.description}
                    </Text>
                    <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between' })}>
                      <Text className="text-xs text-gray-500" style={ta}>
                        {t('challenges.reward', {
                          coins: c.coinReward,
                          xp: c.xpReward,
                        })}
                      </Text>
                      <Button
                        size="sm"
                        variant={isDone ? 'outline' : 'primary'}
                        onPress={() => router.push(`/challenges/${c.id}` as never)}
                      >
                        {isDone ? t('challenges.review') : t('challenges.play')}
                      </Button>
                    </View>
                  </View>
                </View>
              </PressableCard>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
