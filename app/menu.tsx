import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  BookOpen,
  Gift,
  Home,
  Settings,
  User,
  Video,
  X,
} from 'lucide-react-native';

import { useT } from '@/hooks/useT';
import { colors } from '@/theme';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { isAdminEmail, isAdminUIEnabled } from '@/lib/admin';
import { rtlRootDirection, rtlRowMerge, rtlTextStyle, mergeScrollContentRtl } from '@/lib/rtlStyle';

type Item = {
  key: string;
  title: string;
  path: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

export default function MenuScreen() {
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);
  const profile = useUserStore((s) => s.profile);
  const authEmail = useAuthStore((s) => s.user?.email ?? null);

  const adminEnabled = isAdminUIEnabled();
  const isAdmin = isAdminEmail(authEmail);

  const items: Item[] = [
    { key: 'home', title: t('nav.home'), path: '/dashboard', Icon: Home },
    { key: 'fintok', title: t('nav.fintok'), path: '/fintok', Icon: Video },
    { key: 'courses', title: t('nav.courses'), path: '/courses', Icon: BookOpen },
    { key: 'rewards', title: t('nav.rewards'), path: '/marketplace', Icon: Gift },
    { key: 'profile', title: t('nav.profile'), path: '/profile', Icon: User },
    { key: 'settings', title: t('profile.settingsPrefs'), path: '/settings', Icon: Settings },
  ];

  if (adminEnabled && isAdmin) {
    items.push({
      key: 'admin',
      title: t('profile.adminDashboard'),
      path: '/admin',
      Icon: Settings,
    });
  }

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[
        { flex: 1, backgroundColor: colors.gray[50] },
        rtlRootDirection(rtl),
      ]}
    >
      <View
        className="px-4 py-3"
        style={rtlRowMerge(rtl, {
          alignItems: 'center',
          justifyContent: 'space-between',
        })}
      >
        <View
          className="gap-3"
          style={rtlRowMerge(rtl, { alignItems: 'center' })}
        >
          <Text className="text-2xl">{profile.avatar || '👤'}</Text>
          <View>
            <Text style={ta} className="text-base font-semibold text-gray-900">
              {profile.name}
            </Text>
            {!!profile.email && (
              <Text style={ta} className="text-xs text-gray-500" numberOfLines={1}>
                {profile.email}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => router.back()}
          className="p-2 -m-2 active:opacity-60"
          hitSlop={8}
        >
          <X size={22} color={colors.gray[700]} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={mergeScrollContentRtl(rtl, { padding: 16, gap: 12 })}>
        {items.map(({ key, title, path, Icon }) => (
          <Pressable
            key={key}
            onPress={() => {
              router.replace(path as never);
            }}
            className="active:opacity-80"
          >
            <Card>
              <View
                style={rtlRowMerge(rtl, {
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <View
                  className="gap-3"
                  style={rtlRowMerge(rtl, { alignItems: 'center' })}
                >
                  <Icon size={20} color={colors.primary[700]} />
                  <Text style={ta} className="text-gray-900 font-semibold">
                    {title}
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
