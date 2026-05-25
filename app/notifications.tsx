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
import {
  localeBannerAlignStyle,
  localeIconRowStyle,
  mergeScrollContentRtl,
  rtlRootDirection,
  rtlTextStyle,
} from '@/lib/rtlStyle';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores';
import { pullRedemptions, type RemoteRedemption } from '@/lib/syncServiceApi';

export default function NotificationsInboxScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
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

  const reminderState = notificationsEnabled
    ? t('notifications.on')
    : t('notifications.off');

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader title={t('profile.notifications')} showBack />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, {
          padding: 16,
          paddingBottom: 100,
          gap: 12,
        })}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <View style={localeIconRowStyle(rtl)} className="mb-2">
            <Bell size={18} color={colors.primary[700]} />
            <Text style={ta} className="text-gray-900 font-semibold">
              {t('profile.notifications')}
            </Text>
          </View>
          <Text style={ta} className="text-sm text-gray-700">
            {t('notifications.dailyReminder', { state: reminderState })}
          </Text>
          <View className="mt-3">
            <Button
              variant="outline"
              fullWidth
              onPress={() => router.push('/settings' as never)}
            >
              {t('notifications.manageSettings')}
            </Button>
          </View>
        </Card>

        <Card>
          <View style={localeIconRowStyle(rtl)} className="mb-2">
            <Gift size={18} color={colors.primary[700]} />
            <Text style={ta} className="text-gray-900 font-semibold">
              {t('notifications.rewardUpdates')}
            </Text>
          </View>

          {!remoteUserId && (
            <Text style={ta} className="text-sm text-gray-700">
              {t('notifications.signInForRewards')}
            </Text>
          )}

          {remoteUserId && redemptions.length === 0 && (
            <Text style={ta} className="text-sm text-gray-700">
              {t('notifications.noRewardUpdates')}
            </Text>
          )}

          {remoteUserId &&
            redemptions.map((r) => (
              <View key={r.id} className="py-2 border-t border-gray-100">
                <Text
                  style={ta}
                  className="text-sm text-gray-900 font-medium"
                  numberOfLines={1}
                >
                  {r.reward_title}
                </Text>
                <Text style={ta} className="text-xs text-gray-500">
                  {t('notifications.statusLine', {
                    status: r.status,
                    cost: r.cost,
                  })}
                </Text>
              </View>
            ))}

          {remoteUserId && (
            <View className="mt-3">
              <Button
                variant="outline"
                fullWidth
                onPress={refresh}
                disabled={loading}
              >
                {loading ? t('notifications.loading') : t('notifications.refresh')}
              </Button>
            </View>
          )}
        </Card>

        <Card className="border border-gray-200 bg-white" padded>
          <View style={localeIconRowStyle(rtl)} className="mb-1">
            <Info size={18} color={colors.gray[600]} />
            <Text style={ta} className="text-gray-900 font-semibold">
              {t('notifications.inbox')}
            </Text>
          </View>
          <Text style={ta} className="text-sm text-gray-700">
            {t('notifications.inboxBody')}
          </Text>
        </Card>

        <Card className="border border-gray-200 bg-white" padded>
          <View style={localeIconRowStyle(rtl)} className="mb-1">
            <Info size={18} color={colors.gray[600]} />
            <Text style={ta} className="text-gray-900 font-semibold">
              {t('notifications.comingSoon')}
            </Text>
          </View>
          <View style={localeBannerAlignStyle(rtl)}>
            <Text style={ta} className="text-sm text-gray-700">
              {t('notifications.comingSoonList')}
            </Text>
          </View>
        </Card>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
