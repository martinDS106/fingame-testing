import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Gift } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { pullRedemptions, type RemoteRedemption } from '@/lib/syncServiceApi';
import { useUserStore } from '@/stores';
import { useT } from '@/hooks/useT';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function RedemptionsScreen() {
  const { t } = useT();
  const remoteUserId = useUserStore((s) => s.remoteUserId);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<RemoteRedemption[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!remoteUserId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await pullRedemptions(remoteUserId, 100);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteUserId]);

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title={t('profile.rewardRedemption')} showBack showBell={false} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {!remoteUserId && (
          <Card className="border border-yellow-200 bg-yellow-50" padded>
            <Text className="text-gray-900 font-semibold mb-1">Sign in required</Text>
            <Text className="text-sm text-gray-700">
              Redemption history is stored in the cloud. Please sign in first.
            </Text>
          </Card>
        )}

        {remoteUserId && (
          <Card>
            <View className="flex-row items-center gap-2 mb-2">
              <Gift size={18} color={colors.primary[700]} />
              <Text className="text-gray-900 font-semibold">
                {t('profile.rewardRedemption')}
              </Text>
            </View>
            <Text className="text-sm text-gray-700">
              Your redeemed rewards and their status.
            </Text>
            <View className="mt-3">
              <Button variant="outline" fullWidth onPress={refresh} disabled={loading}>
                {loading ? 'Loading…' : 'Refresh'}
              </Button>
            </View>
            {error && (
              <Text className="text-sm text-red-600 mt-2">{error}</Text>
            )}
          </Card>
        )}

        {remoteUserId && rows.length === 0 && (
          <Card className="border border-gray-200 bg-white" padded>
            <Text className="text-gray-900 font-semibold mb-1">No redemptions yet</Text>
            <Text className="text-sm text-gray-700">
              Redeem a reward from the Rewards tab to see it here.
            </Text>
          </Card>
        )}

        {rows.map((r) => (
          <Card key={r.id} className="border border-gray-200 bg-white" padded>
            <Text className="text-gray-900 font-semibold mb-1" numberOfLines={1}>
              {r.reward_title}
            </Text>
            <Text className="text-xs text-gray-500">
              cost: {r.cost} · status: {r.status} · {formatDate(r.created_at)}
            </Text>
          </Card>
        ))}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

