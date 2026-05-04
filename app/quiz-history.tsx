import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { History } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { apiGetJson } from '@/lib/api';
import { useUserStore } from '@/stores';

type QuizAttemptRow = {
  id: string;
  quiz_id: string;
  quiz_title: string;
  quiz_title_ar: string | null;
  score: number;
  total: number;
  coins_earned: number;
  completed_at: string;
};

export default function QuizHistoryScreen() {
  const remoteUserId = useUserStore((s) => s.remoteUserId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<QuizAttemptRow[]>([]);

  async function refresh() {
    if (!remoteUserId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetJson<QuizAttemptRow[]>(
        '/me/quiz-attempts?limit=50',
        { auth: true, timeoutMs: 12000 } as any
      );
      setRows(data ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteUserId]);

  if (!remoteUserId) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Quiz history" showBack />
        <View className="flex-1 px-4 py-6">
          <Card>
            <Text className="text-gray-900 font-semibold mb-1">Sign in required</Text>
            <Text className="text-sm text-gray-700">
              Please sign in to see your quiz history.
            </Text>
          </Card>
          <View className="mt-4">
            <Button variant="outline" fullWidth onPress={() => router.push('/(auth)/login' as never)}>
              Go to login
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Quiz history" showBack showBell={false} />

      <View className="px-4 py-3">
        <Button variant="outline" fullWidth onPress={refresh} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </Button>
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
        {rows.length === 0 ? (
          <Card className="items-center py-10">
            <History size={28} color={colors.gray[500]} />
            <Text className="text-gray-800 font-semibold mt-3">No attempts yet</Text>
            <Text className="text-sm text-gray-600 mt-1 text-center">
              Complete a quiz and it will appear here.
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {rows.map((r) => {
              const when = (() => {
                try {
                  return new Date(r.completed_at).toLocaleString();
                } catch {
                  return r.completed_at;
                }
              })();
              const pct = Math.round((r.score / Math.max(1, r.total)) * 100);
              return (
                <Card key={r.id}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-gray-900 font-semibold">
                        {r.quiz_title || 'Quiz'}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">{when}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-gray-900 font-semibold">
                        {r.score}/{r.total}
                      </Text>
                      <Text className="text-xs text-gray-600">{pct}%</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-xs text-gray-600">
                      Coins earned
                    </Text>
                    <Text className="text-xs text-gray-900 font-semibold">
                      +{r.coins_earned}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

