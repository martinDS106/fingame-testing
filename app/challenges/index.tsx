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
import { useChallengesStore, useUserStore } from '@/stores';

function difficultyColor(d: 'easy' | 'medium' | 'hard'): string {
  if (d === 'easy') return '#16a34a';
  if (d === 'medium') return '#f59e0b';
  return '#dc2626';
}

export default function ChallengesListScreen() {
  const coins = useUserStore((s) => s.coins);
  const challenges = useChallengesStore((s) => s.challenges);
  const completed = useChallengesStore((s) => s.completed);

  const done = completed.length;
  const pct = challenges.length ? (done / challenges.length) * 100 : 0;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Challenges"
        showBack
        showBell={false}
        gradient={[colors.primary[600], colors.primary[700]]}
        rightSlot={
          <View className="flex-row items-center gap-1.5 bg-accent-400 px-3 py-1 rounded-full">
            <Star
              size={14}
              color={colors.primary[900]}
              fill={colors.primary[900]}
            />
            <Text className="text-primary-900 text-sm font-semibold">
              {formatNumber(coins)}
            </Text>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary[600], colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16, padding: 16 }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Flame size={18} color={colors.accent[300]} />
              <Text className="text-white font-semibold">Scenario Mode</Text>
            </View>
            <Text className="text-white/80 text-sm">
              {done}/{challenges.length} complete
            </Text>
          </View>
          <ProgressBar
            value={pct}
            height={6}
            trackClassName="bg-white/20"
            color={colors.accent[400]}
          />
          <Text className="text-white/80 text-xs mt-2">
            Pick the best decision and learn from feedback.
          </Text>
        </LinearGradient>

        <Card className="bg-primary-50 border-primary-100">
          <Text className="text-gray-800 font-semibold mb-2">
            🧠 How it works
          </Text>
          <Text className="text-sm text-gray-600">
            Each challenge is a real-life money situation. Choose one answer.
            You’ll get coins + XP and an explanation.
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
                <View className="flex-row items-start gap-3">
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
                    <View className="flex-row items-start justify-between gap-2 mb-1">
                      <Text className="text-gray-900 font-semibold flex-1">
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
                        {c.difficulty.toUpperCase()}
                      </Badge>
                    </View>
                    <Text className="text-sm text-gray-600 mb-2">
                      {c.description}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-gray-500">
                        Reward: +{c.coinReward} coins · +{c.xpReward} XP
                      </Text>
                      <Button size="sm" variant={isDone ? 'outline' : 'primary'}>
                        {isDone ? 'Review' : 'Play'}
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

