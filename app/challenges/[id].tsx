import { useMemo } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, ChevronRight, Info, Star } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { colors } from '@/theme';
import { formatNumber } from '@/lib/format';
import { useChallengesStore, useUserStore, type ChallengeId } from '@/stores';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const coins = useUserStore((s) => s.coins);
  const completed = useChallengesStore((s) => s.completed);
  const challengeFor = useChallengesStore((s) => s.challengeFor);
  const submit = useChallengesStore((s) => s.submit);

  const challenge = useMemo(
    () => (id ? challengeFor(id as ChallengeId) : undefined),
    [challengeFor, id]
  );

  if (!challenge) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Challenge" showBack showBell={false} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-600">Challenge not found</Text>
          <Button className="mt-3" variant="outline" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  const isDone = completed.includes(challenge.id);

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title={challenge.title}
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
            <Badge
              variant={
                challenge.difficulty === 'easy'
                  ? 'success'
                  : challenge.difficulty === 'medium'
                    ? 'warning'
                    : 'danger'
              }
            >
              {challenge.difficulty.toUpperCase()}
            </Badge>
            {isDone && (
              <View className="flex-row items-center gap-1">
                <CheckCircle2 size={16} color={colors.white} />
                <Text className="text-white font-semibold text-sm">
                  Completed
                </Text>
              </View>
            )}
          </View>
          <Text className="text-white text-lg font-bold mb-1">
            {challenge.description}
          </Text>
          <Text className="text-white/80 text-sm">
            Reward: +{challenge.coinReward} coins · +{challenge.xpReward} XP
          </Text>
        </LinearGradient>

        <Card>
          <View className="flex-row items-start gap-2 mb-2">
            <Info size={18} color={colors.gray[700]} />
            <Text className="text-gray-900 font-semibold">Situation</Text>
          </View>
          <Text className="text-gray-700 leading-5">{challenge.situation}</Text>
        </Card>

        <Card>
          <Text className="text-gray-900 font-semibold mb-2">Choose one:</Text>
          <View className="gap-2">
            {challenge.options.map((opt) => (
              <PressableCard
                key={opt.id}
                onPress={() => {
                  if (isDone) {
                    Alert.alert('Already completed', opt.explanation);
                    return;
                  }
                  Alert.alert(
                    'Confirm choice',
                    opt.label,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Choose',
                        onPress: () => {
                          void (async () => {
                            const res = await submit(challenge.id, opt.id);
                            if (!res.ok) {
                              Alert.alert('Error', res.reason ?? 'Try again');
                              return;
                            }
                            Alert.alert(
                              'Result',
                              `${opt.explanation}\n\n+${challenge.coinReward} coins · +${challenge.xpReward} XP`,
                              [
                                {
                                  text: 'Back to list',
                                  onPress: () => router.replace('/challenges' as never),
                                },
                              ]
                            );
                          })();
                        },
                      },
                    ]
                  );
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center">
                    <ChevronRight size={18} color={colors.primary[700]} />
                  </View>
                  <Text className="text-gray-900 font-medium flex-1">
                    {opt.label}
                  </Text>
                </View>
              </PressableCard>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

