import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Shield } from 'lucide-react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';
import { useAuthStore, useUserStore } from '@/stores';

export default function AdminDashboardScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const allowed = useUserStore((s) => s.isAdmin);
  const syncStatus = useUserStore((s) => s.syncStatus);
  const remoteUserId = useUserStore((s) => s.remoteUserId);
  const emailInUserStore = useUserStore((s) => s.profile.email);
  const bindToUser = useUserStore((s) => s.bindToUser);
  const sessionUser = useAuthStore((s) => s.user);

  if (!allowed) {
    return (
      <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
        <ScreenHeader title="Admin" showBack />
        <View className="flex-1 px-4 py-6">
          <Card className="border border-red-200 bg-red-50">
            <View style={rtlRowMerge(rtl, { alignItems: 'center', gap: 12, marginBottom: 8 })}>
              <Shield size={18} color="#ef4444" />
              <Text className="text-gray-900 font-semibold" style={ta}>
                {t('admin.accessDenied')}
              </Text>
            </View>
            <Text className="text-sm text-gray-700" style={ta}>
              {t('admin.accessDeniedBody')}
            </Text>
            <Text className="text-sm text-gray-600 mt-3" style={ta}>
              {t('admin.accessDeniedHint')}
            </Text>
          </Card>

          <Card className="mt-3">
            <Text className="text-sm text-gray-900 font-semibold mb-2" style={ta}>
              {t('admin.debugInfo')}
            </Text>
            <View className="gap-1">
              <Text className="text-xs text-gray-700" style={ta}>
                Auth email: {sessionUser?.email ?? '—'}
              </Text>
              <Text className="text-xs text-gray-700" style={ta}>
                Store email: {emailInUserStore || '—'}
              </Text>
              <Text className="text-xs text-gray-700" style={ta}>
                remoteUserId: {remoteUserId ?? '—'}
              </Text>
              <Text className="text-xs text-gray-700" style={ta}>
                syncStatus: {syncStatus}
              </Text>
              <Text className="text-xs text-gray-700" style={ta}>
                isAdmin: false
              </Text>
            </View>
          </Card>

          <View className="mt-4">
            <View className="gap-2">
              <Button
                fullWidth
                onPress={async () => {
                  if (!sessionUser?.id) return;
                  await bindToUser(sessionUser.id, sessionUser.email ?? undefined);
                }}
              >
                {t('admin.retrySync')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onPress={() => router.replace('/(auth)/login')}
              >
                {t('admin.backToLogin')}
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={rtlRootDirection(rtl)}>
      <ScreenHeader
        title="Admin Dashboard"
        showBack
        gradient={[colors.gray[900], colors.gray[700]]}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, paddingBottom: 24, gap: 12 })}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Text className="text-lg text-gray-900 font-semibold mb-1" style={ta}>
            Admin dashboard
          </Text>
          <Text className="text-sm text-gray-700" style={ta}>
            Content tools live under Quick actions. English is enough for the app
            to work; Arabic fields are optional. When locale is Arabic, empty
            Arabic falls back to English. If you add Arabic quiz options, use the
            same number of lines as English.
          </Text>
        </Card>

        <Card className="bg-gray-900 border border-gray-800">
          <Text className="text-white font-semibold mb-2" style={ta}>
            Quick actions
          </Text>
          <Text className="text-white/80 text-sm mb-3" style={ta}>
            Supabase RLS + `profiles.is_admin`; syncs refresh the in-app content
            store after saves.
          </Text>
          <View className="gap-2">
            <Button
              variant="secondary"
              onPress={() => router.push('/admin/analytics')}
            >
              Analytics
            </Button>
            <Button variant="secondary" onPress={() => router.push('/admin/users')}>
              User management (full profile data)
            </Button>
            <Button
              variant="secondary"
              onPress={() => router.push('/admin/courses')}
            >
              Manage courses
            </Button>
            <Button
              variant="secondary"
              onPress={() => router.push('/admin/marketplace-products')}
            >
              Manage marketplace products
            </Button>
            <Button variant="secondary" onPress={() => router.push('/admin/quizzes')}>
              Quiz editor
            </Button>
            <Button variant="secondary" onPress={() => router.push('/admin/fintok')}>
              FinTok videos
            </Button>
            <Button
              variant="secondary"
              onPress={() => router.push('/admin/redemptions')}
            >
              Redemptions
            </Button>
            <Button
              variant="secondary"
              onPress={() => router.push('/admin/stock-prices')}
            >
              Stock prices
            </Button>
            <Button
              variant="secondary"
              onPress={() => router.push('/admin/leaderboard')}
            >
              Leaderboard
            </Button>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
