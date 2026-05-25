import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Crown, Medal, Trophy } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  pullLeaderboardTop,
  type RemoteProfile,
  adminPullProfiles,
} from '@/lib/syncServiceApi';
import { colors } from '@/theme';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { useUserStore } from '@/stores';

type Metric = 'coins' | 'xp' | 'streak';

export default function AdminLeaderboardScreen() {
  const { rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const allowed = useUserStore((s) => s.isAdmin);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<RemoteProfile[]>([]);
  const [metric, setMetric] = useState<Metric>('coins');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (metric === 'coins') {
        const top = await pullLeaderboardTop(50);
        const mapped: RemoteProfile[] = top.map((r) => ({
          id: r.user_id,
          display_name: r.display_name,
          avatar: r.avatar,
          level: 'Beginner',
          is_admin: false,
          coins: r.coins,
          xp: r.xp,
          streak: r.streak,
          longest_streak: r.streak,
          last_active_date: null,
          created_at: '',
          updated_at: '',
        }));
        setUsers(mapped);
      } else {
        const data = await adminPullProfiles(500);
        setUsers(data);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [metric]);

  useEffect(() => {
    if (!allowed) return;
    void refresh();
  }, [allowed, refresh]);

  const top = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      if (metric === 'xp') return (b.xp ?? 0) - (a.xp ?? 0);
      if (metric === 'streak') return (b.streak ?? 0) - (a.streak ?? 0);
      return (b.coins ?? 0) - (a.coins ?? 0);
    });
    return sorted.slice(0, 50);
  }, [users, metric]);

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
        title="Leaderboard"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <View className="px-4 pt-3 pb-2">
        <Card>
          <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8, marginBottom: 8 })}>
            <Trophy size={18} color={colors.accent[500]} />
            <Text className="text-gray-900 font-semibold" style={ta}>
              Metric
            </Text>
          </View>
          <View style={rtlRowMerge(rtl, { gap: 8, flexWrap: 'wrap' })}>
            {(
              [
                { id: 'coins', label: 'Coins' },
                { id: 'xp', label: 'XP' },
                { id: 'streak', label: 'Streak' },
              ] as { id: Metric; label: string }[]
            ).map((opt) => {
              const active = metric === opt.id;
              return (
                <Button
                  key={opt.id}
                  size="sm"
                  variant={active ? 'primary' : 'outline'}
                  onPress={() => setMetric(opt.id)}
                >
                  {opt.label}
                </Button>
              );
            })}
          </View>
          <View className="mt-3">
            <Button variant="outline" fullWidth onPress={refresh} disabled={loading}>
              Refresh
            </Button>
          </View>
        </Card>
      </View>

      <ScrollView
        className="flex-1"
        style={rtlRootDirection(rtl)}
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 24, gap: 10 })}
        showsVerticalScrollIndicator={false}
      >
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

        {!error &&
          top.map((u, idx) => {
            const rank = idx + 1;
            const icon =
              rank === 1 ? (
                <Crown size={18} color="#f59e0b" />
              ) : rank <= 3 ? (
                <Medal size={18} color={rank === 2 ? '#9ca3af' : '#b45309'} />
              ) : null;
            const value =
              metric === 'xp' ? u.xp ?? 0 : metric === 'streak' ? u.streak ?? 0 : u.coins ?? 0;
            return (
              <Card key={u.id} className={rank <= 3 ? 'border border-yellow-200 bg-yellow-50' : ''}>
                <View style={rtlRowMerge(rtl, { alignItems: 'center', justifyContent: 'space-between' })}>
                  <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12, flex: 1 })}>
                    <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center">
                      <Text className="text-xl">{u.avatar ?? '👤'}</Text>
                    </View>
                    <View className="flex-1">
                      <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 8 })}>
                        <Text
                          className="text-gray-900 font-semibold"
                          numberOfLines={1}
                          style={ta}
                        >
                          #{rank} {u.display_name}
                        </Text>
                        {icon}
                      </View>
                      <Text className="text-xs text-gray-500" numberOfLines={1} style={ta}>
                        {u.id}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-900 font-bold text-lg" style={ta}>
                      {value}
                    </Text>
                    <Text className="text-xs text-gray-500" style={ta}>
                      {metric}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
      </ScrollView>
    </View>
  );
}

