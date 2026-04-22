import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useContentStore } from '@/stores';

export default function QuizPlayScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const quizId = (params.id ?? '').toString();

  const quiz = useContentStore((s) => s.quizFor(quizId));
  const allQuestions = useContentStore((s) => s.questions);
  const submitAttempt = useContentStore((s) => s.submitAttempt);

  // IMPORTANT: don't subscribe to store selectors that return new arrays/objects
  // each render (it can cause "Maximum update depth exceeded"). Derive here.
  const questions = useMemo(() => {
    return allQuestions
      .filter((q) => q.quizId === quizId)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [allQuestions, quizId]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const current = questions[idx];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const score = useMemo(() => {
    return questions.reduce((acc, q) => {
      const a = answers[q.id];
      if (a === undefined) return acc;
      return acc + (a === q.correctIndex ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  // Defensive guard: if questions array changes mid-session (sync / state reset),
  // avoid crashing and show a friendly message instead.
  if (questions.length > 0 && !current) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title={quiz?.title ?? 'Quiz'} showBack showBell={false} />
        <View className="flex-1 items-center justify-center px-8">
          <HelpCircle size={42} color={colors.gray[500]} />
          <Text className="text-gray-900 font-semibold mt-3">
            Quiz state changed
          </Text>
          <Text className="text-gray-700 text-sm text-center mt-2">
            Please reopen the quiz.
          </Text>
          <View className="mt-4 w-full">
            <Button fullWidth variant="outline" onPress={() => router.back()}>
              Go back
            </Button>
          </View>
        </View>
      </View>
    );
  }

  if (!quizId || !quiz) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Quiz" showBack showBell={false} />
        <View className="flex-1 items-center justify-center px-8">
          <HelpCircle size={42} color={colors.gray[500]} />
          <Text className="text-gray-900 font-semibold mt-3">Quiz not found</Text>
          <View className="mt-4 w-full">
            <Button fullWidth variant="outline" onPress={() => router.back()}>
              Go back
            </Button>
          </View>
        </View>
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title={quiz.title} showBack showBell={false} />
        <View className="flex-1 items-center justify-center px-8">
          <HelpCircle size={42} color={colors.gray[500]} />
          <Text className="text-gray-900 font-semibold mt-3">No questions yet</Text>
          <Text className="text-gray-700 text-sm text-center mt-2">
            This quiz doesn’t have questions loaded. Try syncing content.
          </Text>
          <View className="mt-4 w-full">
            <Button
              fullWidth
              variant="outline"
              onPress={() => router.push('/coming-soon?title=Sync content' as never)}
            >
              Learn more
            </Button>
          </View>
        </View>
      </View>
    );
  }

  async function finish() {
    const total = questions.length;
    await submitAttempt(quizId, score, total);
    Alert.alert(
      'Quiz complete',
      `Score: ${score}/${total}`,
      [{ text: 'OK', onPress: () => router.back() }],
      { cancelable: true }
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={quiz.title} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="border border-gray-200 bg-white" padded>
          <Text className="text-xs text-gray-500 mb-1">
            Question {idx + 1} / {questions.length} · Answered {answeredCount}
          </Text>
          <Text className="text-gray-900 font-semibold text-base">
            {current.question}
          </Text>
        </Card>

        <View className="gap-10">
          {current.options.map((opt, optIdx) => {
            const selected = answers[current.id] === optIdx;
            return (
              <Pressable
                key={`${current.id}-${optIdx}`}
                onPress={() => setAnswers((s) => ({ ...s, [current.id]: optIdx }))}
                className={`p-3 rounded-xl border ${
                  selected
                    ? 'bg-primary-50 border-primary-300'
                    : 'bg-white border-gray-200'
                }`}
              >
                <View className="flex-row items-center justify-between gap-3">
                  <Text
                    className={`flex-1 text-sm ${
                      selected ? 'text-primary-800 font-semibold' : 'text-gray-800'
                    }`}
                  >
                    {opt}
                  </Text>
                  {selected && <CheckCircle2 size={18} color={colors.primary[700]} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              variant="outline"
              fullWidth
              disabled={idx === 0}
              onPress={() => setIdx((v) => Math.max(0, v - 1))}
            >
              Previous
            </Button>
          </View>
          <View className="flex-1">
            {idx < questions.length - 1 ? (
              <Button
                fullWidth
                disabled={answers[current.id] === undefined}
                onPress={() => setIdx((v) => Math.min(questions.length - 1, v + 1))}
              >
                Next
              </Button>
            ) : (
              <Button
                fullWidth
                disabled={answers[current.id] === undefined}
                onPress={finish}
              >
                Submit
              </Button>
            )}
          </View>
        </View>

        <Card className="border border-gray-200 bg-white" padded>
          <View className="flex-row items-center gap-2 mb-1">
            <XCircle size={18} color={colors.gray[600]} />
            <Text className="text-gray-900 font-semibold">Note</Text>
          </View>
          <Text className="text-sm text-gray-700">
            This is a minimal quiz runner for QA. We can enhance it with review mode,
            explanations, and better UX.
          </Text>
        </Card>
      </ScrollView>

    </View>
  );
}

