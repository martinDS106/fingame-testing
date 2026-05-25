import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { router } from 'expo-router';

import { ScreenHeader } from '@/components/ScreenHeader';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useT } from '@/hooks/useT';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { pullLeaderboardTop, type RemoteLeaderboardEntry } from '@/lib/syncServiceApi';

function rankBadgeClass(rank: number) {
  if (rank === 1) return 'bg-accent-100';
  if (rank === 2) return 'bg-gray-100';
  if (rank === 3) return 'bg-orange-100';
  return 'bg-gray-50';
}

function rankTextClass(rank: number) {
  if (rank === 1) return 'text-accent-700';
  if (rank === 2) return 'text-gray-700';
  if (rank === 3) return 'text-orange-700';
  return 'text-gray-700';
}

export default function LeaderboardScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<RemoteLeaderboardEntry[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const data = await pullLeaderboardTop(10);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title={t('dashboard.leaderboard')}
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 100, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View
            className="mb-2"
            style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}
          >
            <Trophy size={18} color={colors.accent[500]} />
            <Text style={ta} className="text-gray-900 font-semibold">
              {t('dashboard.leaderboard')}
            </Text>
          </View>
          <View className="mb-2">
            <Button variant="outline" fullWidth onPress={refresh} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </Button>
          </View>
          <View className="gap-2">
            {rows.map((user, idx) => {
              const rank = idx + 1;
              return (
                <View
                  key={user.user_id}
                  className="py-2"
                  style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12 })}
                >
                  <Text className="text-2xl">{user.avatar ?? '👤'}</Text>
                  <View className="flex-1">
                    <Text style={ta} className="text-sm text-gray-900 font-medium">
                      {user.display_name}
                    </Text>
                    <Text style={ta} className="text-xs text-gray-500">
                      {t('dashboard.points', {
                        points: (user.coins ?? 0).toLocaleString(),
                      })}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${rankBadgeClass(rank)}`}
                  >
                    <Text
                      style={ta}
                      className={`text-sm font-semibold ${rankTextClass(rank)}`}
                    >
                      #{rank}
                    </Text>
                  </View>
                </View>
              );
            })}
            {!loading && rows.length === 0 && (
              <Text style={ta} className="text-sm text-gray-600">
                No leaderboard data yet.
              </Text>
            )}
          </View>
        </Card>

        <Button
          variant="outline"
          fullWidth
          onPress={() => router.push('/coming-soon?title=Competition' as never)}
        >
          {t('dashboard.joinCompetition')}
        </Button>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
