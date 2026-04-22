import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bell, Menu } from 'lucide-react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { CoinsCounter } from '@/components/CoinsCounter';
import { colors } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  coins?: number;
  showBack?: boolean;
  showMenu?: boolean;
  showBell?: boolean;
  notificationCount?: number;
  rightSlot?: ReactNode;
  gradient?: [string, string];
  onBack?: () => void;
  onBellPress?: () => void;
  onMenuPress?: () => void;
}

export function ScreenHeader({
  title,
  coins,
  showBack = false,
  showMenu = false,
  showBell = true,
  notificationCount = 0,
  rightSlot,
  gradient,
  onBack,
  onBellPress,
  onMenuPress,
}: ScreenHeaderProps) {
  const gradientColors: [string, string] =
    gradient ?? [colors.primary[600], colors.primary[700]];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <SafeAreaView edges={['top']}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center gap-2 flex-1">
            {showBack ? (
              <Pressable
                onPress={onBack ?? (() => router.back())}
                className="p-1 -m-1 active:opacity-60"
                hitSlop={8}
              >
                <ArrowLeft size={24} color={colors.white} />
              </Pressable>
            ) : showMenu ? (
              <Pressable
                onPress={onMenuPress}
                className="p-1 -m-1 active:opacity-60"
                hitSlop={8}
              >
                <Menu size={24} color={colors.white} />
              </Pressable>
            ) : null}

            <Text
              className="text-xl text-white font-semibold"
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            {rightSlot}

            {typeof coins === 'number' && <CoinsCounter coins={coins} />}

            {showBell && (
              <Pressable
                onPress={onBellPress ?? (() => router.push('/notifications' as never))}
                className="p-1 -m-1 active:opacity-60"
                hitSlop={8}
              >
                <View>
                  <Bell size={22} color={colors.white} />
                  {notificationCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center px-1">
                      <Text className="text-white text-[10px] font-bold">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
