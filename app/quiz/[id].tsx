import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { notifyError, notifySuccess } from '@/lib/celebration';
import { useContentStore } from '@/stores';

export default function QuizPlayScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const quizId = (params.id ?? '').toString();
  const { rtl, t } = useT();
  const ta = rtlTextStyle(rtl);

  const quiz = useContentStore((s) => s.quizFor(quizId));
  const allQuestions = useContentStore((s) => s.questions);
  const submitAttempt = useContentStore((s) => s.submitAttempt);
  const syncQuestionsForQuiz = useContentStore((s) => s.syncQuestionsForQuiz);
  const syncStatus = useContentStore((s) => s.syncStatus);

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
  const [autoSyncAttempted, setAutoSyncAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const current = questions[idx];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  useEffect(() => {
    if (!quizId) return;
    if (questions.length > 0) return;
    if (autoSyncAttempted) return;
    setAutoSyncAttempted(true);
    void syncQuestionsForQuiz(quizId);
  }, [quizId, questions.length, autoSyncAttempted, syncQuestionsForQuiz]);

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
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader title={quiz?.title ?? 'Quiz'} showBack showBell={false} />
        <View className="flex-1 items-center justify-center px-8">
          <HelpCircle size={42} color={colors.gray[500]} />
          <Text className="text-gray-900 font-semibold mt-3" style={ta}>
            Quiz state changed
          </Text>
          <Text className="text-gray-700 text-sm text-center mt-2" style={ta}>
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
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader title="Quiz" showBack showBell={false} />
        <View className="flex-1 items-center justify-center px-8">
          <HelpCircle size={42} color={colors.gray[500]} />
          <Text className="text-gray-900 font-semibold mt-3" style={ta}>
            Quiz not found
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

  if (!questions.length) {
    return (
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader title={quiz.title} showBack showBell={false} />
        <View className="flex-1 items-center justify-center px-8">
          <HelpCircle size={42} color={colors.gray[500]} />
          <Text className="text-gray-900 font-semibold mt-3" style={ta}>
            {syncStatus === 'syncing' ? 'Syncing questions…' : 'No questions yet'}
          </Text>
          <Text className="text-gray-700 text-sm text-center mt-2" style={ta}>
            This quiz doesn’t have questions loaded yet. Please retry sync.
          </Text>
          <View className="mt-4 w-full">
            <Button
              fullWidth
              variant="primary"
              disabled={syncStatus === 'syncing'}
              onPress={() => void syncQuestionsForQuiz(quizId)}
            >
              Retry sync
            </Button>
          </View>
        </View>
      </View>
    );
  }

  async function finish() {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setSubmitting(true);

    const total = questions.length;
    try {
      const res = await submitAttempt(quizId, score, total);
      if (!res.ok) {
        submittedRef.current = false;
        notifyError('Could not save result', res.error || 'Please sign in again.');
        return;
      }

      notifySuccess(
        t('quiz.completeTitle'),
        t('quiz.completeBody', { score, total, coins: res.coinsEarned }),
      );
      setTimeout(() => router.back(), 400);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader title={quiz.title} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        <Card className="border border-gray-200 bg-white" padded>
          <Text className="text-xs text-gray-500 mb-1" style={ta}>
            Question {idx + 1} / {questions.length} · Answered {answeredCount}
          </Text>
          <Text className="text-gray-900 font-semibold text-base" style={ta}>
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
                <View
                  style={rtlRowMerge(rtl, {
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  })}
                >
                  <Text
                    className={`flex-1 text-sm ${
                      selected ? 'text-primary-800 font-semibold' : 'text-gray-800'
                    }`}
                    style={ta}
                  >
                    {opt}
                  </Text>
                  {selected && <CheckCircle2 size={18} color={colors.primary[700]} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={rtlRowMerge(rtl, { gap: 8 })}>
          <View className="flex-1">
            <Button
              variant="outline"
              fullWidth
              disabled={idx === 0 || submitting}
              onPress={() => setIdx((v) => Math.max(0, v - 1))}
            >
              Previous
            </Button>
          </View>
          <View className="flex-1">
            {idx < questions.length - 1 ? (
              <Button
                fullWidth
                disabled={answers[current.id] === undefined || submitting}
                onPress={() => setIdx((v) => Math.min(questions.length - 1, v + 1))}
              >
                Next
              </Button>
            ) : (
              <Button
                fullWidth
                disabled={answers[current.id] === undefined || submitting}
                onPress={() => void finish()}
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </Button>
            )}
          </View>
        </View>

        <Card className="border border-gray-200 bg-white" padded>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 4 })}>
            <XCircle size={18} color={colors.gray[600]} />
            <Text className="text-gray-900 font-semibold" style={ta}>
              Note
            </Text>
          </View>
          <Text className="text-sm text-gray-700" style={ta}>
            This is a minimal quiz runner for QA. We can enhance it with review mode,
            explanations, and better UX.
          </Text>
        </Card>
      </ScrollView>

    </View>
  );
}
