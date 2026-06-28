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
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { localizeChallenge } from '@/lib/challengesLocale';
import { useT } from '@/hooks/useT';
import { notifyError, notifySuccess } from '@/lib/celebration';
import { useChallengesStore, useUserStore, type ChallengeId } from '@/stores';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, locale, rtl } = useT();
  const ta = rtlTextStyle(rtl);

  const coins = useUserStore((s) => s.coins);
  const completed = useChallengesStore((s) => s.completed);
  const challengeFor = useChallengesStore((s) => s.challengeFor);
  const submit = useChallengesStore((s) => s.submit);

  const challenge = useMemo(() => {
    const raw = id ? challengeFor(id as ChallengeId) : undefined;
    return raw ? localizeChallenge(raw, locale) : undefined;
  }, [challengeFor, id, locale]);

  if (!challenge) {
    return (
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader title={t('challenges.detailTitle')} showBack showBell={false} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-600" style={ta}>
            {t('challenges.notFound')}
          </Text>
          <Button className="mt-3" variant="outline" onPress={() => router.back()}>
            {t('challenges.goBack')}
          </Button>
        </View>
      </View>
    );
  }

  const isDone = completed.includes(challenge.id);

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={challenge.title}
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
            <Badge
              variant={
                challenge.difficulty === 'easy'
                  ? 'success'
                  : challenge.difficulty === 'medium'
                    ? 'warning'
                    : 'danger'
              }
            >
              {t(`challenges.difficulty.${challenge.difficulty}`)}
            </Badge>
            {isDone && (
              <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 4 })}>
                <CheckCircle2 size={16} color={colors.white} />
                <Text className="text-white font-semibold text-sm" style={ta}>
                  {t('challenges.completed')}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-white text-lg font-bold mb-1" style={ta}>
            {challenge.description}
          </Text>
          <Text className="text-white/80 text-sm" style={ta}>
            {t('challenges.reward', {
              coins: challenge.coinReward,
              xp: challenge.xpReward,
            })}
          </Text>
        </LinearGradient>

        <Card>
          <View style={rtlRowMerge(rtl, { alignItems: 'flex-start', gap: 8, marginBottom: 8 })}>
            <Info size={18} color={colors.gray[700]} />
            <Text className="text-gray-900 font-semibold" style={ta}>
              {t('challenges.situation')}
            </Text>
          </View>
          <Text className="text-gray-700 leading-5" style={ta}>
            {challenge.situation}
          </Text>
        </Card>

        <Card>
          <Text className="text-gray-900 font-semibold mb-2" style={ta}>
            {t('challenges.chooseOne')}
          </Text>
          <View className="gap-2">
            {challenge.options.map((opt) => (
              <PressableCard
                key={opt.id}
                onPress={() => {
                  if (isDone) {
                    Alert.alert(t('challenges.alreadyCompleted'), opt.explanation);
                    return;
                  }
                  Alert.alert(
                    t('challenges.confirmChoice'),
                    opt.label,
                    [
                      { text: t('action.cancel'), style: 'cancel' },
                      {
                        text: t('challenges.choose'),
                        onPress: () => {
                          void (async () => {
                            const res = await submit(challenge.id, opt.id);
                            if (!res.ok) {
                              notifyError(
                                t('challenges.error'),
                                res.reason ?? t('challenges.tryAgain'),
                              );
                              return;
                            }
                            notifySuccess(
                              t('challenges.result'),
                              `${opt.explanation}\n\n+${challenge.coinReward} coins · +${challenge.xpReward} XP`,
                            );
                            setTimeout(() => router.replace('/challenges' as never), 500);
                          })();
                        },
                      },
                    ]
                  );
                }}
              >
                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12 })}>
                  <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center">
                    <ChevronRight size={18} color={colors.primary[700]} />
                  </View>
                  <Text className="text-gray-900 font-medium flex-1" style={ta}>
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
