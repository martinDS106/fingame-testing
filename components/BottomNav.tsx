import { Pressable, Text, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, BookOpen, Gift, User, Video } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import type { ComponentType } from 'react';

import { colors } from '@/theme';
import { rtlRootDirection, rtlRow, rtlTextStyle } from '@/lib/rtlStyle';
import { useT } from '@/hooks/useT';

interface NavItem {
  labelKey: string;
  path: string;
  Icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string }>;
}

const navItems: NavItem[] = [
  { labelKey: 'nav.home', path: '/dashboard', Icon: Home },
  { labelKey: 'nav.fintok', path: '/fintok', Icon: Video },
  { labelKey: 'nav.courses', path: '/courses', Icon: BookOpen },
  { labelKey: 'nav.rewards', path: '/marketplace', Icon: Gift },
  { labelKey: 'nav.profile', path: '/profile', Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t, rtl } = useT();
  const ta = rtlTextStyle(rtl);

  return (
    <View
      className="absolute left-0 right-0 bottom-0 bg-white border-t border-gray-200"
      style={[
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        rtlRootDirection(rtl),
      ]}
    >
      <SafeAreaView edges={['bottom']}>
        <View
          className="py-2"
          style={[
            {
              alignItems: 'center',
              justifyContent: 'space-around',
            },
            rtlRow(rtl),
          ]}
        >
          {navItems.map(({ labelKey, path, Icon }) => {
            const isActive =
              pathname === path || pathname.startsWith(`${path}/`);
            const color = isActive ? colors.primary[600] : colors.gray[500];

            return (
              <Pressable
                key={path}
                onPress={() => {
                  if (!isActive) router.push(path as never);
                }}
                className="flex-1 items-center gap-1 py-2 px-1 active:opacity-60"
              >
                <Icon
                  size={22}
                  color={color}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive && Platform.OS !== 'web' ? color : 'transparent'}
                />
                <Text
                  className="text-[11px] font-medium"
                  style={[ta, { color }]}
                >
                  {t(labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}
