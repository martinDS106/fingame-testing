import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { HelpCircle } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useContentStore } from '@/stores';
import { useT } from '@/hooks/useT';

export default function QuizzesScreen() {
  const { t } = useT();
  const quizzes = useContentStore((s) => s.quizzes);

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title={t('dashboard.dailyQuiz')}
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {!quizzes.length && (
          <Card className="border border-gray-200 bg-white" padded>
            <View className="flex-row items-center gap-2 mb-1">
              <HelpCircle size={18} color={colors.gray[600]} />
              <Text className="text-gray-900 font-semibold">
                {t('common.comingSoon')}
              </Text>
            </View>
            <Text className="text-sm text-gray-700">
              No quizzes found yet. Try syncing content.
            </Text>
            <View className="mt-3">
              <Button
                variant="outline"
                fullWidth
                onPress={() =>
                  router.push('/coming-soon?title=Quiz Sync' as never)
                }
              >
                Learn more
              </Button>
            </View>
          </Card>
        )}

        {quizzes.map((q) => (
          <PressableCard
            key={q.id}
            onPress={() => router.push(`/quiz/${q.id}` as never)}
          >
            <Text className="text-gray-900 font-semibold mb-1" numberOfLines={1}>
              {q.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {q.description}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-500">
                {q.category} · {q.difficulty}
              </Text>
              <Text className="text-xs text-gray-500">
                reward: {q.coinReward}
              </Text>
            </View>
          </PressableCard>
        ))}
      </ScrollView>

    </View>
  );
}

