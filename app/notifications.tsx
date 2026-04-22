import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Bell, Gift, Info } from 'lucide-react-native';
import { router } from 'expo-router';

import { ScreenHeader } from '@/components/ScreenHeader';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme';
import { useT } from '@/hooks/useT';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores';
import { pullRedemptions, type RemoteRedemption } from '@/lib/syncService';

export default function NotificationsInboxScreen() {
  const { t } = useT();
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const remoteUserId = useUserStore((s) => s.remoteUserId);

  const [loading, setLoading] = useState(false);
  const [redemptions, setRedemptions] = useState<RemoteRedemption[]>([]);

  async function refresh() {
    if (!remoteUserId) return;
    setLoading(true);
    try {
      const data = await pullRedemptions(remoteUserId, 10);
      setRedemptions(data);
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
      <ScreenHeader title={t('profile.notifications')} showBack />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View className="flex-row items-center gap-2 mb-2">
            <Bell size={18} color={colors.primary[700]} />
            <Text className="text-gray-900 font-semibold">
              {t('profile.notifications')}
            </Text>
          </View>
          <Text className="text-sm text-gray-700">
            Daily reminder: {notificationsEnabled ? 'On' : 'Off'} (8:00 PM)
          </Text>
          <View className="mt-3">
            <Button
              variant="outline"
              fullWidth
              onPress={() => router.push('/settings' as never)}
            >
              Manage in Settings
            </Button>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-2 mb-2">
            <Gift size={18} color={colors.primary[700]} />
            <Text className="text-gray-900 font-semibold">Reward updates</Text>
          </View>

          {!remoteUserId && (
            <Text className="text-sm text-gray-700">
              Sign in to see your redemption updates.
            </Text>
          )}

          {remoteUserId && redemptions.length === 0 && (
            <Text className="text-sm text-gray-700">
              No reward updates yet.
            </Text>
          )}

          {remoteUserId &&
            redemptions.map((r) => (
              <View key={r.id} className="py-2 border-t border-gray-100">
                <Text className="text-sm text-gray-900 font-medium" numberOfLines={1}>
                  {r.reward_title}
                </Text>
                <Text className="text-xs text-gray-500">
                  Status: {r.status} · Cost: {r.cost}
                </Text>
              </View>
            ))}

          {remoteUserId && (
            <View className="mt-3">
              <Button variant="outline" fullWidth onPress={refresh} disabled={loading}>
                {loading ? 'Loading…' : 'Refresh'}
              </Button>
            </View>
          )}
        </Card>

        <Card className="border border-gray-200 bg-white" padded>
          <View className="flex-row items-center gap-2 mb-1">
            <Info size={18} color={colors.gray[600]} />
            <Text className="text-gray-900 font-semibold">Inbox</Text>
          </View>
          <Text className="text-sm text-gray-700">
            This is a simple notifications inbox. Next we can add streak alerts, quiz
            reminders, and unread counts.
          </Text>
        </Card>

        <Card className="border border-gray-200 bg-white" padded>
          <View className="flex-row items-center gap-2 mb-1">
            <Info size={18} color={colors.gray[600]} />
            <Text className="text-gray-900 font-semibold">Coming soon</Text>
          </View>
          <Text className="text-sm text-gray-700">
            - Streak & level-up alerts{'\n'}- New course drops{'\n'}- Quiz challenge
            invites{'\n'}- FinTok highlights
          </Text>
        </Card>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

