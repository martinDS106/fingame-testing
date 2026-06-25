import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { router } from 'expo-router';

import { ScreenHeader } from '@/components/ScreenHeader';
import { BottomNav } from '@/components/BottomNav';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useT } from '@/hooks/useT';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { pullLeaderboardTop, type RemoteLeaderboardEntry } from '@/lib/syncServiceApi';

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
                <LeaderboardRow
                  key={user.user_id}
                  rtl={rtl}
                  rank={rank}
                  displayName={user.display_name}
                  avatar={user.avatar}
                  coins={user.coins}
                  xp={user.xp}
                  streak={user.streak}
                  pointsLabel={t('dashboard.points', {
                    points: (user.coins ?? 0).toLocaleString(),
                  })}
                  showXpStreak
                />
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
