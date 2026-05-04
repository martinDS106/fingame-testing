import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BarChart3, Database, Users } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { adminCounts, adminDashboardStats } from '@/lib/syncServiceApi';
import { colors } from '@/theme';
import { useUserStore } from '@/stores';

export default function AdminAnalyticsScreen() {
  const allowed = useUserStore((s) => s.isAdmin);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<{
    users: number;
    courses: number;
    lessons: number;
    videos: number;
    quizzes: number;
    questions: number;
    marketplaceProducts: number;
  } | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminDashboardStats>>>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const c = await adminCounts();
      setCounts(c);
      const s = await adminDashboardStats();
      setStats(s);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!allowed) return;
    void refresh();
  }, [allowed]);

  const subtitle = useMemo(() => {
    if (loading) return 'Loading…';
    if (error) return 'Error';
    return 'Overview';
  }, [loading, error]);

  if (!allowed) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Admin" showBack />
        <View className="flex-1 px-4 py-6">
          <Card className="border border-red-200 bg-red-50">
            <Text className="text-gray-900 font-semibold mb-1">Access denied</Text>
            <Text className="text-sm text-gray-700">
              This area is restricted to admins.
            </Text>
          </Card>
          <View className="mt-4">
            <Button variant="outline" fullWidth onPress={() => router.back()}>
              Go Back
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Analytics"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View className="flex-row items-center gap-2 mb-1">
            <BarChart3 size={18} color={colors.primary[700]} />
            <Text className="text-gray-900 font-semibold">Snapshot</Text>
          </View>
          <Text className="text-sm text-gray-600">{subtitle}</Text>
          <View className="mt-3">
            <Button variant="outline" fullWidth onPress={refresh} disabled={loading}>
              Refresh
            </Button>
          </View>
        </Card>

        {error && (
          <Card className="border border-red-200 bg-red-50">
            <Text className="text-gray-900 font-semibold mb-1">Load failed</Text>
            <Text className="text-sm text-gray-700">{error}</Text>
          </Card>
        )}

        {counts && (
          <>
            <Card>
              <View className="flex-row items-center gap-2 mb-2">
                <Users size={18} color={colors.gray[700]} />
                <Text className="text-gray-900 font-semibold">Users</Text>
              </View>
              <Text className="text-3xl text-gray-900 font-bold">
                {counts.users}
              </Text>
              {stats && (
                <Text className="text-xs text-gray-500 mt-1">
                  Active (7d): {stats.users_active_7d}
                </Text>
              )}
            </Card>

            {stats && (
              <Card>
                <View className="flex-row items-center gap-2 mb-2">
                  <Database size={18} color={colors.gray[700]} />
                  <Text className="text-gray-900 font-semibold">Points</Text>
                </View>
                <View className="gap-1">
                  <Text className="text-sm text-gray-700">
                    Total coins: {stats.coins_total}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Total XP: {stats.xp_total}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Quiz attempts: {stats.quiz_attempts_total}
                  </Text>
                </View>
              </Card>
            )}

            {stats && (
              <Card>
                <View className="flex-row items-center gap-2 mb-2">
                  <Database size={18} color={colors.gray[700]} />
                  <Text className="text-gray-900 font-semibold">Redemptions</Text>
                </View>
                <View className="gap-1">
                  <Text className="text-sm text-gray-700">
                    Total: {stats.redemptions_total}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Pending: {stats.redemptions_pending}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Fulfilled: {stats.redemptions_fulfilled}
                  </Text>
                  <Text className="text-sm text-gray-700">
                    Rejected: {stats.redemptions_rejected}
                  </Text>
                </View>
              </Card>
            )}

            <Card>
              <View className="flex-row items-center gap-2 mb-2">
                <Database size={18} color={colors.gray[700]} />
                <Text className="text-gray-900 font-semibold">Content</Text>
              </View>
              <View className="gap-1">
                <Text className="text-sm text-gray-700">
                  Courses: {counts.courses}
                </Text>
                <Text className="text-sm text-gray-700">
                  Lessons: {counts.lessons}
                </Text>
                <Text className="text-sm text-gray-700">
                  Videos: {counts.videos}
                </Text>
                <Text className="text-sm text-gray-700">
                  Quizzes: {counts.quizzes}
                </Text>
                <Text className="text-sm text-gray-700">
                  Questions: {counts.questions}
                </Text>
                <Text className="text-sm text-gray-700">
                  Marketplace products: {counts.marketplaceProducts}
                </Text>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

