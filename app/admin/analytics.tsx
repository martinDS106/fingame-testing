import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BarChart3, Database, Users } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { adminCounts, adminDashboardStats } from '@/lib/syncServiceApi';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { colors } from '@/theme';
import { useUserStore } from '@/stores';

export default function AdminAnalyticsScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
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
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader title="Admin" showBack />
        <View className="flex-1 px-4 py-6">
          <Card className="border border-red-200 bg-red-50">
            <Text className="text-gray-900 font-semibold mb-1" style={ta}>
              Access denied
            </Text>
            <Text className="text-sm text-gray-700" style={ta}>
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
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title="Analytics"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <ScrollView
        className="flex-1"
        style={rtlRootDirection(rtl)}
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 24, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 4 })}>
            <BarChart3 size={18} color={colors.primary[700]} />
            <Text className="text-gray-900 font-semibold" style={ta}>
              Snapshot
            </Text>
          </View>
          <Text className="text-sm text-gray-600" style={ta}>
            {subtitle}
          </Text>
          <View className="mt-3">
            <Button variant="outline" fullWidth onPress={refresh} disabled={loading}>
              Refresh
            </Button>
          </View>
        </Card>

        {error && (
          <Card className="border border-red-200 bg-red-50">
            <Text className="text-gray-900 font-semibold mb-1" style={ta}>
              Load failed
            </Text>
            <Text className="text-sm text-gray-700" style={ta}>
              {error}
            </Text>
          </Card>
        )}

        {counts && (
          <>
            <Card>
              <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 8 })}>
                <Users size={18} color={colors.gray[700]} />
                <Text className="text-gray-900 font-semibold" style={ta}>
                  Users
                </Text>
              </View>
              <Text className="text-3xl text-gray-900 font-bold" style={ta}>
                {counts.users}
              </Text>
              {stats && (
                <Text className="text-xs text-gray-500 mt-1" style={ta}>
                  Active (7d): {stats.users_active_7d}
                </Text>
              )}
            </Card>

            {stats && (
              <Card>
                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 8 })}>
                  <Database size={18} color={colors.gray[700]} />
                  <Text className="text-gray-900 font-semibold" style={ta}>
                    Points
                  </Text>
                </View>
                <View className="gap-1">
                  <Text className="text-sm text-gray-700" style={ta}>
                    Total coins: {stats.coins_total}
                  </Text>
                  <Text className="text-sm text-gray-700" style={ta}>
                    Total XP: {stats.xp_total}
                  </Text>
                  <Text className="text-sm text-gray-700" style={ta}>
                    Quiz attempts: {stats.quiz_attempts_total}
                  </Text>
                </View>
              </Card>
            )}

            {stats && (
              <Card>
                <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 8 })}>
                  <Database size={18} color={colors.gray[700]} />
                  <Text className="text-gray-900 font-semibold" style={ta}>
                    Redemptions
                  </Text>
                </View>
                <View className="gap-1">
                  <Text className="text-sm text-gray-700" style={ta}>
                    Total: {stats.redemptions_total}
                  </Text>
                  <Text className="text-sm text-gray-700" style={ta}>
                    Pending: {stats.redemptions_pending}
                  </Text>
                  <Text className="text-sm text-gray-700" style={ta}>
                    Fulfilled: {stats.redemptions_fulfilled}
                  </Text>
                  <Text className="text-sm text-gray-700" style={ta}>
                    Rejected: {stats.redemptions_rejected}
                  </Text>
                </View>
              </Card>
            )}

            <Card>
              <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 8 })}>
                <Database size={18} color={colors.gray[700]} />
                <Text className="text-gray-900 font-semibold" style={ta}>
                  Content
                </Text>
              </View>
              <View className="gap-1">
                <Text className="text-sm text-gray-700" style={ta}>
                  Courses: {counts.courses}
                </Text>
                <Text className="text-sm text-gray-700" style={ta}>
                  Lessons: {counts.lessons}
                </Text>
                <Text className="text-sm text-gray-700" style={ta}>
                  Videos: {counts.videos}
                </Text>
                <Text className="text-sm text-gray-700" style={ta}>
                  Quizzes: {counts.quizzes}
                </Text>
                <Text className="text-sm text-gray-700" style={ta}>
                  Questions: {counts.questions}
                </Text>
                <Text className="text-sm text-gray-700" style={ta}>
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
